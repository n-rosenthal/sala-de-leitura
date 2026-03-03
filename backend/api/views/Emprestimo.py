"""
    `backend/api/views/Emprestimo.py`

    ViewSet para o modelo `Emprestimo`.

    @version: 2.0
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from django.core.exceptions import PermissionDenied

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from ..models import Emprestimo, Livro, Associado
from ..serializers import EmprestimoSerializer
from ..services.audit_log import audit_log

DIAS_RENOVACAO = 7


# --------------------------------------------------------------------------- #
#  Module-level helpers                                                        #
# --------------------------------------------------------------------------- #

def _get_associado(user) -> Associado:
    """
    Retorna o Associado vinculado ao usuário ou lança ValidationError.
    Tenta o accessor reverso do OneToOneField antes de fazer uma query extra.
    """
    try:
        return user.associado
    except Associado.DoesNotExist:
        raise ValidationError({"detail": "Usuário não vinculado a um associado."})


def _lock_livro(livro_id: int) -> Livro:
    """SELECT FOR UPDATE no livro, garantindo exclusividade dentro de uma transação."""
    try:
        return Livro.objects.select_for_update().get(pk=livro_id)
    except Livro.DoesNotExist:
        raise ValidationError({"livro": "Livro não encontrado."})


# --------------------------------------------------------------------------- #
#  ViewSet                                                                     #
# --------------------------------------------------------------------------- #

class EmprestimoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Empréstimos.

    Permissões
    ----------
    Todos os endpoints exigem autenticação (IsAuthenticated).
    Apenas gerentes/administradores devem criar e atualizar empréstimos —
    aplique IsStaff nas ações 'create', 'update', 'partial_update' via
    get_permissions() quando a regra de negócio estiver definida.

    Endpoints personalizados
    ------------------------
    GET  /api/emprestimos/ativos/          Empréstimos sem devolução
    GET  /api/emprestimos/atrasados/       Empréstimos vencidos e não devolvidos
    POST /api/emprestimos/{id}/devolver/   Devolução dedicada
    POST /api/emprestimos/{id}/renovar/    Renovação de prazo
    """

    serializer_class = EmprestimoSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["livro", "associado"]
    search_fields = ["livro__titulo", "associado__user__username"]
    ordering_fields = ["data_emprestimo", "data_prevista", "livro__titulo"]
    ordering = ["-data_emprestimo"]

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        return (
            Emprestimo.objects
            .select_related("livro", "associado__user", "quem_emprestou__user", "quem_devolveu__user")
            .all()
            .order_by("-data_emprestimo")
        )

    # ---------------------------------------------------------------------- #
    #  Perform overrides                                                       #
    # ---------------------------------------------------------------------- #

    @transaction.atomic
    def perform_create(self, serializer):
        """
        Cria um empréstimo com lock otimista no livro.

        O SELECT FOR UPDATE garante que dois gerentes não emprestem o mesmo
        exemplar simultaneamente.
        """
        livro = _lock_livro(serializer.validated_data["livro"].pk)

        if livro.status != Livro.Status.DISPONIVEL:
            raise ValidationError({"livro": "Este livro não está disponível para empréstimo."})

        gerente = _get_associado(self.request.user)

        emprestimo = serializer.save(
            data_emprestimo=timezone.now().date(),
            quem_emprestou=gerente,
        )

        audit_log(
            action="EMPRESTIMO",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            user=self.request.user,
            request=self.request,
            message=f"Empréstimo criado: livro '{livro.titulo}' → {emprestimo.associado}",
        )

    @transaction.atomic
    def perform_update(self, serializer):
        """
        Atualiza um empréstimo.

        Se `data_devolucao` for informada pela primeira vez, trata como
        devolução: atualiza quem_devolveu e libera o livro.
        """
        instance = self.get_object()

        devolucao_antes = instance.data_devolucao
        devolucao_depois = serializer.validated_data.get("data_devolucao")

        if devolucao_antes is not None and devolucao_depois is not None:
            raise ValidationError({"data_devolucao": "Este empréstimo já foi encerrado."})

        if devolucao_antes is None and devolucao_depois is not None:
            serializer.validated_data["quem_devolveu"] = _get_associado(self.request.user)
            emprestimo = serializer.save()
            Livro.objects.filter(pk=instance.livro.pk).update(status=Livro.Status.DISPONIVEL)

            audit_log(
                action="DEVOLUCAO",
                resource_type="emprestimo",
                resource_id=emprestimo.id,
                user=self.request.user,
                request=self.request,
                message=f"Livro devolvido via update: '{instance.livro.titulo}'",
            )
        else:
            emprestimo = serializer.save()
            audit_log(
                action="UPDATE",
                resource_type="emprestimo",
                resource_id=emprestimo.id,
                user=self.request.user,
                request=self.request,
                message=f"Empréstimo {emprestimo.id} atualizado",
            )

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Empréstimos não podem ser removidos.")

    # ---------------------------------------------------------------------- #
    #  Custom actions                                                          #
    # ---------------------------------------------------------------------- #

    @action(detail=False, methods=["get"], url_path="ativos")
    def ativos(self, request):
        """Empréstimos ativos (não devolvidos)."""
        return self._paginated_response(
            self.filter_queryset(
                self.get_queryset().filter(data_devolucao__isnull=True)
            )
        )

    @action(detail=False, methods=["get"], url_path="atrasados")
    def atrasados(self, request):
        """
        Empréstimos com data_prevista vencida e ainda não devolvidos.

        GET /api/emprestimos/atrasados/
        """
        hoje = timezone.now().date()
        return self._paginated_response(
            self.filter_queryset(
                self.get_queryset().filter(
                    data_devolucao__isnull=True,
                    data_prevista__lt=hoje,
                )
            )
        )

    @action(detail=True, methods=["post"], url_path="devolver")
    @transaction.atomic
    def devolver(self, request, pk=None):
        """
        Devolução via endpoint dedicado.

        POST /api/emprestimos/{id}/devolver/
        """
        emprestimo = self.get_object()

        if emprestimo.data_devolucao is not None:
            return Response(
                {"detail": "Este empréstimo já foi devolvido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        gerente = _get_associado(request.user)
        emprestimo.data_devolucao = timezone.now().date()
        emprestimo.quem_devolveu = gerente
        emprestimo.save()  # save() do modelo atualiza o status do livro

        audit_log(
            action="DEVOLUCAO",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            user=request.user,
            request=request,
            message=f"Livro devolvido: '{emprestimo.livro.titulo}'",
        )

        return Response(self.get_serializer(emprestimo).data)

    @action(detail=True, methods=["post"], url_path="renovar")
    @transaction.atomic
    def renovar(self, request, pk=None):
        """
        Renova um empréstimo ativo, estendendo data_prevista em DIAS_RENOVACAO dias.

        POST /api/emprestimos/{id}/renovar/
        """
        emprestimo = self.get_object()

        if emprestimo.data_devolucao is not None:
            raise ValidationError(
                {"emprestimo": "Este empréstimo já foi devolvido e não pode ser renovado."}
            )

        base = emprestimo.data_prevista or timezone.now().date()
        nova_data = base + timedelta(days=DIAS_RENOVACAO)

        emprestimo.data_prevista = nova_data
        emprestimo.save()

        audit_log(
            action="RENOVACAO",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            user=request.user,
            request=request,
            message=f"Empréstimo {emprestimo.id} renovado até {nova_data}",
            details={"nova_data_prevista": str(nova_data)},
        )

        return Response(self.get_serializer(emprestimo).data, status=status.HTTP_200_OK)

    # ---------------------------------------------------------------------- #
    #  Private helpers                                                         #
    # ---------------------------------------------------------------------- #

    def _paginated_response(self, queryset):
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

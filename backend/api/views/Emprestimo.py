"""
    `backend/api/views/Emprestimo.py`

    @version: 1.3
"""
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from django.core.exceptions import PermissionDenied

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from ..models import Emprestimo, Livro, Associado
from ..serializers import EmprestimoSerializer
from ..services.audit_service import AuditService


def _get_associado(user):
    """Retorna o Associado vinculado ao usuário ou lança ValidationError."""
    try:
        return user.associado
    except Exception:
        try:
            return Associado.objects.get(user=user)
        except Associado.DoesNotExist:
            raise ValidationError({"detail": "Usuário não vinculado a um associado."})


class EmprestimoViewSet(viewsets.ModelViewSet):
    serializer_class = EmprestimoSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["livro", "associado"]
    search_fields = ["livro__titulo"]
    ordering_fields = ["data_emprestimo", "livro__titulo"]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Emprestimo.objects.all().order_by("-data_emprestimo")
        try:
            return Emprestimo.objects.filter(
                associado=user.associado
            ).order_by("-data_emprestimo")
        except Exception:
            return Emprestimo.objects.none()

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "devolver_livro", "renovar"]:
            return [IsAuthenticated(), IsStaff()]
        return [IsAuthenticated()]

    @transaction.atomic
    def perform_create(self, serializer):
        """
        ✅ Bug 3 corrigido: a verificação de disponibilidade agora usa select_for_update()
        e está dentro de transaction.atomic, prevenindo race conditions.
        O modelo também trava no clean(), garantindo dupla proteção.
        """
        livro_id = serializer.validated_data["livro"].pk

        # Trava o livro para escrita exclusiva durante esta transação
        livro = Livro.objects.select_for_update().get(pk=livro_id)

        if livro.status != Livro.Status.DISPONIVEL:
            raise ValidationError({"livro": "Este livro não está disponível para empréstimo."})

        gerente = _get_associado(self.request.user)

        # serializer.save() chama Emprestimo.save() → full_clean() → clean()
        # O lock já está ativo, então o clean() vai encontrar o livro travado corretamente
        emprestimo = serializer.save(
            data_emprestimo=timezone.now().date(),
            quem_emprestou=gerente,
        )

        AuditService.log(
            user=self.request.user,
            action="EMPRESTIMO",
            success=True,
            message="Empréstimo criado com sucesso",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            request=self.request,
        )

    @transaction.atomic
    def perform_update(self, serializer):
        instance = self.get_object()
        livro = instance.livro

        devolucao_antes = instance.data_devolucao
        devolucao_depois = serializer.validated_data.get("data_devolucao")

        if devolucao_antes is not None and devolucao_depois is not None:
            raise ValidationError({"data_devolucao": "Este empréstimo já foi encerrado."})

        if devolucao_antes is None and devolucao_depois is not None:
            gerente_devolucao = _get_associado(self.request.user)
            serializer.validated_data["quem_devolveu"] = gerente_devolucao

            emprestimo = serializer.save()

            Livro.objects.filter(pk=livro.pk).update(status=Livro.Status.DISPONIVEL)

            AuditService.log(
                user=self.request.user,
                action="DEVOLUCAO",
                success=True,
                message="Livro devolvido com sucesso",
                resource_type="emprestimo",
                resource_id=emprestimo.id,
                request=self.request,
            )
        else:
            emprestimo = serializer.save()
            AuditService.log(
                user=self.request.user,
                action="UPDATE",
                success=True,
                message="Empréstimo atualizado",
                resource_type="emprestimo",
                resource_id=emprestimo.id,
                request=self.request,
            )

    @action(detail=False, methods=["get"], url_path="ativos")
    def ativos(self, request):
        """Retorna empréstimos ainda ativos (não devolvidos)."""
        queryset = self.filter_queryset(
            self.get_queryset().filter(data_devolucao__isnull=True)
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="devolver")
    @transaction.atomic
    def devolver_livro(self, request, pk=None):
        """Devolução de livro via endpoint dedicado."""
        emprestimo = self.get_object()

        if emprestimo.data_devolucao is not None:
            return Response(
                {"error": "Este empréstimo já foi devolvido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        gerente = _get_associado(request.user)

        emprestimo.data_devolucao = timezone.now().date()
        emprestimo.quem_devolveu = gerente
        emprestimo.save()   # save() do modelo já atualiza o status do livro

        AuditService.log(
            user=request.user,
            action="DEVOLUCAO",
            success=True,
            message="Livro devolvido com sucesso",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            request=request,
        )

        serializer = self.get_serializer(emprestimo)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="renovar")
    @transaction.atomic
    def renovar(self, request, pk=None):
        """
        Renova um empréstimo ativo, estendendo data_prevista em 7 dias.
        ✅ Bug 4 corrigido: usa data_prevista (nome correto do campo).
        """
        emprestimo = self.get_object()

        if emprestimo.data_devolucao is not None:
            raise ValidationError(
                {"emprestimo": "Este empréstimo já foi devolvido e não pode ser renovado."}
            )

        dias_renovacao = 7
        base = emprestimo.data_prevista or timezone.now().date()
        nova_data = base + timedelta(days=dias_renovacao)

        # ✅ nome correto do campo: data_prevista
        emprestimo.data_prevista = nova_data
        emprestimo.save()

        AuditService.log(
            user=request.user,
            action="RENOVACAO",
            success=True,
            message="Empréstimo renovado com sucesso",
            resource_type="emprestimo",
            resource_id=emprestimo.id,
            details={"nova_data_prevista": str(nova_data)},
            request=request,
        )

        serializer = self.get_serializer(emprestimo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Empréstimos não podem ser removidos.")
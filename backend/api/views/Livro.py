"""
    `backend/api/views/Livro.py`

    ViewSet para o modelo `Livro`.

    @version: 3.0
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from django_filters.rest_framework import DjangoFilterBackend

from ..models import Emprestimo, Livro
from ..serializers import LivroSerializer
from ..permissions import IsStaff
from ..utils import generate_diff
from ..services.audit_log import audit_log


class LivroViewSet(viewsets.ModelViewSet):
    """
    ViewSet para entidade `Livro`.

    Permissões
    ----------
    Usuários autenticados           GET / list / retrieve / verificar / diagnostico
    Gerente / Administrador         POST / PATCH / PUT / DELETE
    Qualquer um (AllowAny)          GET diagnostico
    """

    queryset = Livro.objects.all().order_by("titulo")
    serializer_class = LivroSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["titulo", "autor"]
    ordering_fields = ["titulo", "autor", "ano"]
    ordering = ["titulo"]

    # ---------------------------------------------------------------------- #
    #  Permissions                                                             #
    # ---------------------------------------------------------------------- #

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsStaff()]
        if self.action == "diagnostico":
            return [AllowAny()]
        return [IsAuthenticated()]

    # ---------------------------------------------------------------------- #
    #  Perform overrides                                                       #
    # ---------------------------------------------------------------------- #

    def perform_create(self, serializer):
        instance = serializer.save()
        audit_log(
            action="CREATE",
            resource_type="livro",
            resource_id=instance.id,
            user=self.request.user,
            request=self.request,
            message=f"Livro criado: '{instance.titulo}'",
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        instance = serializer.save()

        diff = generate_diff(
            old_instance,
            serializer.validated_data,
            ["titulo", "autor", "ano", "status"],
        )

        if diff:
            audit_log(
                action="UPDATE",
                resource_type="livro",
                resource_id=instance.id,
                user=self.request.user,
                request=self.request,
                message=f"Livro atualizado: '{instance.titulo}'",
                diff=diff,
            )

    def perform_destroy(self, instance):
        audit_log(
            action="DELETE",
            resource_type="livro",
            resource_id=instance.id,
            user=self.request.user,
            request=self.request,
            message=f"Livro excluído: '{instance.titulo}' (autor: {instance.autor})",
        )
        instance.delete()

    # ---------------------------------------------------------------------- #
    #  Custom actions — list                                                   #
    # ---------------------------------------------------------------------- #

    @action(detail=False, methods=["get"], url_path="disponiveis")
    def disponiveis(self, request):
        """Livros disponíveis para empréstimo."""
        return self._status_list(request, Livro.Status.DISPONIVEL)

    @action(detail=False, methods=["get"], url_path="emprestados")
    def emprestados(self, request):
        """Livros atualmente emprestados."""
        return self._status_list(request, Livro.Status.EMPRESTADO)

    @action(
        detail=False,
        methods=["get"],
        url_path="diagnostico",
        url_name="diagnostico",
    )
    def diagnostico(self, request):
        """
        Agrupa todos os livros por título, mostrando cópias e status.
        Público — não requer autenticação.

        GET /api/livros/diagnostico/
        """
        try:
            livros = Livro.objects.all().order_by("titulo", "id")

            result: dict = {}
            for livro in livros:
                entry = result.setdefault(livro.titulo, {
                    "total_copias": 0,
                    "copias_disponiveis": 0,
                    "ides": [],
                })
                entry["ides"].append({"id": livro.id, "status": livro.status})
                entry["total_copias"] += 1
                if livro.status == Livro.Status.DISPONIVEL:
                    entry["copias_disponiveis"] += 1

            return Response(
                {
                    "status": "success",
                    "total_titulos": len(result),
                    "total_copias": livros.count(),
                    "dados": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:  # noqa: BLE001
            return Response(
                {"status": "error", "message": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # ---------------------------------------------------------------------- #
    #  Custom actions — detail                                                 #
    # ---------------------------------------------------------------------- #

    @action(detail=True, methods=["get"])
    def verificar(self, request, pk=None):
        """
        Verifica disponibilidade e consistência de um livro específico.

        GET /api/livros/{id}/verificar/
        """
        livro = self.get_object()

        emprestimo_ativo = (
            Emprestimo.objects
            .filter(livro=livro, data_devolucao__isnull=True)
            .select_related("associado__user")
            .first()
        )

        consistencia = _verificar_consistencia(livro, emprestimo_ativo)

        return Response({
            "pode_ser_emprestado": livro.status == Livro.Status.DISPONIVEL,
            "status": livro.status,
            "status_display": livro.get_status_display(),
            "emprestimo_ativo": (
                {
                    "id": emprestimo_ativo.id,
                    "associado": emprestimo_ativo.associado.user.get_full_name()
                        or emprestimo_ativo.associado.user.username,
                    "data_emprestimo": emprestimo_ativo.data_emprestimo,
                    "data_prevista": emprestimo_ativo.data_prevista,
                }
                if emprestimo_ativo else None
            ),
            "consistencia": consistencia,
        })

    # ---------------------------------------------------------------------- #
    #  Private helpers                                                         #
    # ---------------------------------------------------------------------- #

    def _status_list(self, request, livro_status):
        """Filtra por status, respeita filtros/busca e pagina o resultado."""
        queryset = self.filter_queryset(
            self.get_queryset().filter(status=livro_status)
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)


# --------------------------------------------------------------------------- #
#  Module-level helpers                                                        #
# --------------------------------------------------------------------------- #

def _verificar_consistencia(livro: Livro, emprestimo_ativo) -> dict:
    """
    Detecta inconsistências entre o status do livro e seus empréstimos.

    Returns a dict with `ok: bool` and an optional `problemas` list.
    """
    problemas = []

    if livro.status == Livro.Status.DISPONIVEL and emprestimo_ativo:
        problemas.append(
            "Livro marcado como DISPONÍVEL mas possui empréstimo ativo sem devolução."
        )

    if livro.status == Livro.Status.EMPRESTADO and not emprestimo_ativo:
        problemas.append(
            "Livro marcado como EMPRESTADO mas não há empréstimo ativo registrado."
        )

    return {"ok": not problemas, "problemas": problemas}

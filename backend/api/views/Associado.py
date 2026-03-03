"""
    `backend/api/views/Associado.py`

    ViewSet para o modelo `Associado`.
    `Associado` é o perfil estendido de um `User` da aplicação.

    @version: 3.0
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response

from django.db import transaction
from django.core.exceptions import ValidationError

from ..models import Associado
from ..serializers import AssociadoSerializer, AssociadoCreateSerializer
from ..services.audit_log import audit_log


class AssociadoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Associados.

    Permissões
    ----------
    create                  AllowAny    (registro público)
    list / retrieve         IsAuthenticated
    update / partial_update IsAuthenticated + IsOwnerOrStaff  (ver get_permissions)
    destroy                 IsAdminUser
    me / atualizar_me       IsAuthenticated
    activate / deactivate   IsAdminUser
    search_associados       IsAuthenticated

    Endpoints personalizados
    ------------------------
    GET         /api/associados/me/
    PUT/PATCH   /api/associados/me/atualizar/
    POST        /api/associados/{id}/activate/
    POST        /api/associados/{id}/deactivate/
    GET         /api/associados/search/?q=termo
    """

    queryset = Associado.objects.select_related("user").all()
    serializer_class = AssociadoSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "user__username",
        "user__email",
        "user__first_name",
        "user__last_name",
        "telefone",
    ]
    ordering_fields = ["user__username", "user__date_joined", "aniversario", "data_cadastro"]
    ordering = ["user__username"]

    # ---------------------------------------------------------------------- #
    #  Permissions & serializer selection                                      #
    # ---------------------------------------------------------------------- #

    def get_permissions(self):
        """
        Permissões granulares por ação.

        NOTE: IsOwnerOrStaff is a custom permission you should implement in
        `api/permissions.py`.  Until then the commented line falls back to
        IsAuthenticated.
        """
        if self.action == "create":
            return [AllowAny()]
        if self.action in ["activate", "deactivate", "destroy"]:
            return [IsAdminUser()]
        if self.action in ["update", "partial_update"]:
            # return [IsAuthenticated(), IsOwnerOrStaff()]
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return AssociadoCreateSerializer
        return AssociadoSerializer

    def get_queryset(self):
        """
        Admins vêem todos os associados.
        Usuários normais vêem apenas associados ativos.
        """
        queryset = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            return queryset.none()

        if user.is_superuser or user.is_staff:
            return queryset

        return queryset.filter(user__is_active=True)

    # ---------------------------------------------------------------------- #
    #  CRUD overrides                                                          #
    # ---------------------------------------------------------------------- #

    def create(self, request, *args, **kwargs):
        """Registro de novo Associado (cria User + Associado atomicamente)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                associado = serializer.save()
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        audit_log(
            action="CREATE",
            resource_type="associado",
            resource_id=associado.id,
            # No authenticated user during public registration; log the new username.
            message=f"Associado registrado: '{associado.user.username}'",
        )

        response_serializer = AssociadoSerializer(associado, context=self.get_serializer_context())
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Atualização completa de Associado.
        Username não pode ser alterado via este endpoint.
        """
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        data = request.data.copy()
        data.pop("username", None)  # username é imutável aqui

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                self.perform_update(serializer)
        except ValidationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        audit_log(
            action="UPDATE",
            resource_type="associado",
            resource_id=instance.id,
            user=request.user,
            request=request,
            message=f"Associado atualizado: '{instance.user.username}'",
        )

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        """
        Deleta o Associado e o User vinculado.
        Restrito a administradores (IsAdminUser via get_permissions).
        """
        instance = self.get_object()
        user = instance.user

        try:
            with transaction.atomic():
                self.perform_destroy(instance)
                user.delete()
        except Exception as exc:
            return Response(
                {"detail": f"Erro ao deletar: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        audit_log(
            action="DELETE",
            resource_type="associado",
            resource_id=instance.id,
            user=request.user,
            request=request,
            message=f"Associado excluído: '{user.username}'",
        )

        return Response({"detail": "Associado deletado com sucesso."}, status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()

    # ---------------------------------------------------------------------- #
    #  Custom actions — self                                                   #
    # ---------------------------------------------------------------------- #

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """
        Retorna o perfil do usuário autenticado.

        GET /api/associados/me/
        """
        associado = self._get_my_associado(request)
        return Response(self.get_serializer(associado).data)

    @action(detail=False, methods=["put", "patch"], url_path="me/atualizar")
    def atualizar_me(self, request):
        """
        Atualiza o perfil do usuário autenticado.
        Username é protegido da mesma forma que no update() padrão.

        PUT/PATCH /api/associados/me/atualizar/
        """
        associado = self._get_my_associado(request)

        data = request.data.copy()
        data.pop("username", None)

        serializer = self.get_serializer(
            associado,
            data=data,
            partial=(request.method == "PATCH"),
            context=self.get_serializer_context(),
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            serializer.save()

        audit_log(
            action="UPDATE",
            resource_type="associado",
            resource_id=associado.id,
            user=request.user,
            request=request,
            message=f"Associado atualizou o próprio perfil: '{request.user.username}'",
        )

        return Response(serializer.data)

    # ---------------------------------------------------------------------- #
    #  Custom actions — admin                                                  #
    # ---------------------------------------------------------------------- #

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """
        Ativa um associado.  Admin only.

        POST /api/associados/{id}/activate/
        """
        associado = self.get_object()

        if associado.user.is_active:
            return Response(
                {"detail": "Associado já está ativo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        associado.user.is_active = True
        associado.user.save(update_fields=["is_active"])

        audit_log(
            action="ACTIVATE",
            resource_type="associado",
            resource_id=associado.id,
            user=request.user,
            request=request,
            message=f"Associado ativado: '{associado.user.username}'",
        )

        return Response({"detail": "Associado ativado com sucesso."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """
        Desativa um associado.  Admin only.
        Impede que o admin desative a si mesmo.

        POST /api/associados/{id}/deactivate/
        """
        associado = self.get_object()

        if associado.user == request.user:
            return Response(
                {"detail": "Não é possível desativar seu próprio usuário."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not associado.user.is_active:
            return Response(
                {"detail": "Associado já está inativo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        associado.user.is_active = False
        associado.user.save(update_fields=["is_active"])

        audit_log(
            action="DEACTIVATE",
            resource_type="associado",
            resource_id=associado.id,
            user=request.user,
            request=request,
            message=f"Associado desativado: '{associado.user.username}'",
        )

        return Response({"detail": "Associado desativado com sucesso."}, status=status.HTTP_200_OK)

    # ---------------------------------------------------------------------- #
    #  Custom actions — search                                                 #
    # ---------------------------------------------------------------------- #

    @action(detail=False, methods=["get"], url_path="search")
    def search_associados(self, request):
        """
        Busca avançada por username, e-mail ou nome.
        Admins recebem resultados incluindo inativos.

        GET /api/associados/search/?q=termo
        """
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response(
                {"detail": 'Parâmetro de busca "q" é requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Q objects evitam os múltiplos querysets unidos com |, que geram UNIONs
        # ineficientes e podem duplicar resultados.
        from django.db.models import Q

        qs = self.get_queryset().filter(
            Q(user__username__icontains=query)
            | Q(user__email__icontains=query)
            | Q(user__first_name__icontains=query)
            | Q(user__last_name__icontains=query)
        )

        # get_queryset() já filtra inativos para não-admins
        return self._paginated_response(qs)

    # ---------------------------------------------------------------------- #
    #  Private helpers                                                         #
    # ---------------------------------------------------------------------- #

    def _get_my_associado(self, request) -> Associado:
        try:
            return request.user.associado
        except Associado.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Perfil de associado não encontrado.")

    def _paginated_response(self, queryset):
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

"""
    backend/api/views/Me.py

    Endpoint que retorna o usuário autenticado,
    incluindo roles e permissões para guards server-side e UI condicional.
"""

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from ..models import Emprestimo, Associado
from ..serializers import EmprestimoSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user

    #   roles { user, staff, admin }
    roles = ["user"]

    if user.is_staff:
        roles.append("staff")

    if user.is_superuser:
        roles.append("admin")

    # =========================
    # Permissions
    # =========================
    permissions = set()

    # Permissões diretas
    for perm in user.user_permissions.all():
        permissions.add(f"{perm.content_type.app_label}:{perm.codename}")

    # Permissões via grupos
    for group in user.groups.all():
        for perm in group.permissions.all():
            permissions.add(f"{perm.content_type.app_label}:{perm.codename}")

    return Response({
        "id": user.id,
        "email": user.email,
        "name": user.get_full_name() or user.username,
        "roles": roles,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "permissions": sorted(permissions),
    })



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def emprestimos_me_view(request):
    """
        View para retornar todos os empréstimos de um associado (usuário logado)
    """
    user = request.user

    try:
        associado = user.associado
    except Associado.DoesNotExist:
        return Response([], status=200)

    qs = Emprestimo.objects.filter(associado=associado)

    serializer = EmprestimoSerializer(qs, many=True)
    return Response(serializer.data)
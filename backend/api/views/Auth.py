"""
    `backend/api/views/Auth.py`
    
    ViewSet para autenticação de usuário.
"""

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

#   tipo resposta da api
from rest_framework.response import Response

#   viewset para API, classes permissão
from rest_framework.decorators import api_view, permission_classes

#   classe de permissão `AllowAny`, verificação de autenticação
from rest_framework.permissions import AllowAny, IsAuthenticated

#   refresh token jwt
from rest_framework_simplejwt.tokens import RefreshToken

#   tipo exceção erro de autenticação
from rest_framework.exceptions import AuthenticationFailed

#   autenticação do django/backend
from django.contrib.auth import authenticate

#   configuração do django/backend
from django.conf import settings

#   conf. cookies
SECURE_COOKIE = not settings.DEBUG


#   logging, serviço de auditoria (logging)
from ..services.audit_service import AuditService


def serialize_user(user):
    """
    Serializa o usuário no formato esperado pelo frontend.
    """

    # Roles
    roles = ["user"]
    if user.is_staff:
        roles.append("staff")
    if user.is_superuser:
        roles.append("admin")

    # Permissions (ex: livros:create)
    permissions = [
        f"{perm.content_type.app_label}:{perm.codename.replace('add_', 'create_')}"
        .replace("change_", "update_")
        .replace("delete_", "delete_")
        for perm in user.user_permissions.all()
    ]

    # Superuser recebe todas implicitamente (opcional)
    if user.is_superuser:
        permissions.append("*")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.get_full_name() or user.username,
        "roles": roles,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "permissions": permissions,
    }

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Autentica o usuário e retorna tokens via cookies HTTP-only
    junto com os dados do usuário autenticado.
    """

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if not user:
        #   (logging)
        AuditService.log(
            action="LOGIN_FAILED",
            success=False,
            message="Credenciais inválidas: {}".format(username),
            request=request
        )
        
        return Response(
            {"detail": "Credenciais inválidas"},
            status=401
        )

    refresh = RefreshToken.for_user(user)

    response = Response({
        "ok": True,
        "user": serialize_user(user),
    })

    response.set_cookie(
        "access_token",
        str(refresh.access_token),
        httponly=True,
        secure=SECURE_COOKIE,
        samesite="Lax",
        path="/",
    )

    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=SECURE_COOKIE,
        samesite="Lax",
        path="/",
    )

    return response

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    
    #   Auditoria de logout
    AuditService.log(
        action="LOGOUT",
        success=True,
        message="Logout bem-sucedido",
        request=request
    )
    
    response = Response({"ok": True})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return response

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_view(request):
    """
    Renova o access_token usando refresh_token via cookie HTTP-only.
    """

    refresh_token = request.COOKIES.get("refresh_token")

    if not refresh_token:
        raise AuthenticationFailed("Refresh token ausente")

    try:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token
    except Exception:
        raise AuthenticationFailed("Refresh token inválido ou expirado")

    response = Response({"ok": True})

    response.set_cookie(
        "access_token",
        str(access),
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Lax",
        path="/",
    )

    return response
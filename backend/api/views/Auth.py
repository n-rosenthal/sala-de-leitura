"""
    `api/views/Auth.py`

    Views de autenticação baseadas em JWT via cookies HttpOnly.

    Endpoints
    ---------
    POST /api/auth/login/    → autentica, seta cookies, retorna Associado
    POST /api/auth/logout/   → blacklista refresh token, apaga cookies
    POST /api/auth/refresh/  → renova access token a partir do cookie refresh
    GET  /api/auth/me/       → retorna o Associado do usuário autenticado
"""

import logging

from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from api.serializers.auth import LoginSerializer, AssociadoAuthSerializer
from api.models import Associado

logger = logging.getLogger("api.auth")

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_cookie_settings(secure: bool) -> dict:
    """Retorna os atributos comuns para set_cookie."""
    return {
        "httponly": True,
        "secure": secure,
        "samesite": settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax"),
    }


def _set_auth_cookies(response: Response, refresh: RefreshToken) -> None:
    """Seta os cookies de access e refresh token na resposta."""
    jwt_settings  = settings.SIMPLE_JWT
    secure        = jwt_settings.get("AUTH_COOKIE_SECURE", not settings.DEBUG)
    cookie_kwargs = _get_cookie_settings(secure)

    access_name  = jwt_settings.get("AUTH_COOKIE", "access_token")
    refresh_name = jwt_settings.get("AUTH_COOKIE_REFRESH", "refresh_token")

    access_lifetime  = jwt_settings.get("ACCESS_TOKEN_LIFETIME")
    refresh_lifetime = jwt_settings.get("REFRESH_TOKEN_LIFETIME")

    response.set_cookie(
        access_name,
        str(refresh.access_token),
        max_age=int(access_lifetime.total_seconds()) if access_lifetime else None,
        **cookie_kwargs,
    )
    response.set_cookie(
        refresh_name,
        str(refresh),
        max_age=int(refresh_lifetime.total_seconds()) if refresh_lifetime else None,
        **cookie_kwargs,
    )


def _delete_auth_cookies(response: Response) -> None:
    """Remove os cookies de autenticação da resposta."""
    jwt_settings = settings.SIMPLE_JWT
    response.delete_cookie(jwt_settings.get("AUTH_COOKIE", "access_token"))
    response.delete_cookie(jwt_settings.get("AUTH_COOKIE_REFRESH", "refresh_token"))


def _get_associado(user) -> Associado:
    """Retorna o Associado vinculado ao User, ou lança 404."""
    try:
        return user.associado
    except Associado.DoesNotExist:
        from rest_framework.exceptions import NotFound
        raise NotFound("Perfil de associado não encontrado para este usuário.")


# ─── Views ────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    """
    POST /api/auth/login/

    Autentica o usuário, seta cookies HttpOnly e retorna o Associado.

    Request body:
        { "username": "...", "password": "..." }

    Response 200:
        { "user": <Associado> }
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        user      = serializer.validated_data["user"]
        associado = _get_associado(user)
        refresh   = RefreshToken.for_user(user)

        response = Response(
            {"user": AssociadoAuthSerializer(associado).data},
            status=status.HTTP_200_OK,
        )
        _set_auth_cookies(response, refresh)

        logger.info("Login bem-sucedido", extra={"user": user.username})
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Blacklista o refresh token atual e apaga os cookies.
    Requer autenticação (cookie de acesso válido).

    Response 204: No Content
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_name  = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
        refresh_token = request.COOKIES.get(refresh_name)

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, InvalidToken):
                # Token já expirado ou inválido — prossegue com o logout de qualquer forma
                logger.warning(
                    "Logout com refresh token inválido",
                    extra={"user": request.user.username},
                )

        response = Response(status=status.HTTP_204_NO_CONTENT)
        _delete_auth_cookies(response)

        logger.info("Logout realizado", extra={"user": request.user.username})
        return response


class RefreshView(APIView):
    """
    POST /api/auth/refresh/

    Lê o cookie `refresh_token`, emite um novo par de tokens
    (ROTATE_REFRESH_TOKENS=True) e atualiza os cookies.

    Não exige autenticação — o access token pode estar expirado.

    Response 200: {}  (tokens entregues via cookies)
    """

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_name  = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
        refresh_token = request.COOKIES.get(refresh_name)

        if not refresh_token:
            return Response(
                {"detail": "Refresh token não encontrado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh  = RefreshToken(refresh_token)
            # blacklista o token atual e emite um novo (ROTATE_REFRESH_TOKENS)
            refresh.blacklist()
            new_refresh = RefreshToken.for_user(refresh.access_token.payload)
        except (TokenError, InvalidToken) as exc:
            return Response(
                {"detail": "Refresh token inválido ou expirado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        response = Response({}, status=status.HTTP_200_OK)
        _set_auth_cookies(response, new_refresh)
        return response


class MeView(APIView):
    """
    GET /api/auth/me/

    Retorna o Associado do usuário autenticado.
    Usado pelo AuthContext para restaurar a sessão após F5.

    Response 200: <Associado>
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        associado = _get_associado(request.user)
        return Response(AssociadoAuthSerializer(associado).data)
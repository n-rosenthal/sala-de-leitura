from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse

class JWTRefreshMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code != 401:
            return response

        refresh = request.COOKIES.get("refresh_token")
        if not refresh:
            return response

        try:
            token = RefreshToken(refresh)
            new_access = str(token.access_token)
        except Exception:
            return response

        response.set_cookie(
            "access_token",
            new_access,
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
        )

        return response

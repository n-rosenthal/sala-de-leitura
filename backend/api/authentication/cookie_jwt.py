# api/authentication/cookie_jwt.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """Reads the JWT access token from an HttpOnly cookie instead of the Authorization header."""

    def authenticate(self, request):
        cookie_name = getattr(settings, "SIMPLE_JWT", {}).get("AUTH_COOKIE", "access_token")
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            return None  # No cookie → unauthenticated (not an error)

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
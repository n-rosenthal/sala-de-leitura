# Autenticação — CookieJWTAuthentication

## Visão geral

A autenticação do backend usa **JWT (JSON Web Tokens)** armazenados em cookies **HttpOnly**, em vez do cabeçalho `Authorization: Bearer`. Isso evita que o token seja acessado via JavaScript, reduzindo a superfície de ataque contra XSS.

A classe `CookieJWTAuthentication` estende o `JWTAuthentication` do `djangorestframework-simplejwt`.

---

## Arquivos relevantes

| Arquivo | Responsabilidade |
|---|---|
| `api/authentication/__init__.py` | Torna `authentication` um pacote Python |
| `api/authentication/cookie_jwt.py` | Classe de autenticação customizada |
| `core/settings.py` → `REST_FRAMEWORK` | Registra a classe como padrão do DRF |
| `core/settings.py` → `SIMPLE_JWT` | Configura nomes e flags dos cookies |

---

## Como funciona

```
Request do cliente
      │
      ▼
CookieJWTAuthentication.authenticate(request)
      │
      ├── Lê request.COOKIES["access_token"]
      │         │
      │         ├── Cookie ausente → retorna None (requisição anônima)
      │         │
      │         └── Cookie presente → valida o JWT
      │                   │
      │                   ├── Token inválido/expirado → lança AuthenticationFailed
      │                   │
      │                   └── Token válido → retorna (user, token)
      ▼
   View executada com request.user populado
```

---

## Configuração (`settings.py`)

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "api.authentication.cookie_jwt.CookieJWTAuthentication",
    ),
    ...
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,   # exige rest_framework_simplejwt.token_blacklist em INSTALLED_APPS
    "AUTH_COOKIE": "access_token",      # nome do cookie de acesso
    "AUTH_COOKIE_REFRESH": "refresh_token",
    "AUTH_COOKIE_SECURE": not DEBUG,    # True em produção (HTTPS obrigatório)
    "AUTH_COOKIE_HTTP_ONLY": True,      # inacessível via JS
    "AUTH_COOKIE_SAMESITE": "Lax",
}
```

---

## Implementação

```python
# api/authentication/cookie_jwt.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """Lê o JWT do cookie HttpOnly em vez do header Authorization."""

    def authenticate(self, request):
        cookie_name = getattr(settings, "SIMPLE_JWT", {}).get("AUTH_COOKIE", "access_token")
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            return None  # sem cookie → anônimo, não é erro

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
```

---

## Fluxo de login / refresh esperado

As views de login e refresh são responsáveis por **escrever** os cookies na resposta. A classe acima apenas os **lê**.

```
POST /api/auth/login/
  → valida credenciais
  → gera access + refresh token
  → response.set_cookie("access_token", ...)
  → response.set_cookie("refresh_token", ...)

POST /api/auth/refresh/
  → lê "refresh_token" do cookie
  → gera novo par de tokens (ROTATE_REFRESH_TOKENS=True)
  → blacklista o refresh token anterior
  → escreve novos cookies na resposta

POST /api/auth/logout/
  → blacklista o refresh token atual
  → deleta ambos os cookies
```

---

## Dependências

```
djangorestframework-simplejwt
rest_framework_simplejwt.token_blacklist  # em INSTALLED_APPS
```

Após adicionar `token_blacklist`, rodar:

```bash
python manage.py migrate
```

---

## Segurança

| Proteção | Mecanismo |
|---|---|
| XSS | `HttpOnly=True` — JS não acessa o cookie |
| CSRF | `SameSite=Lax` + `CSRF_TRUSTED_ORIGINS` no settings |
| Token expirado | `ACCESS_TOKEN_LIFETIME = 15min` |
| Refresh comprometido | `BLACKLIST_AFTER_ROTATION=True` invalida tokens rotacionados |
| Produção | `Secure=True` quando `DEBUG=False` (HTTPS obrigatório) |
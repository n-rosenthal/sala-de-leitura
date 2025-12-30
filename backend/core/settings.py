"""
    `backend/core/settings.py`, configuração do projeto Django/backend
    
    Este arquivo contém as configurações globais do Django, incluindo:
    - Apps instalados
    - Middlewares
    - Banco de dados
    - Autenticação
    - Logging
    - Variáveis de ambiente
"""

from pathlib import Path
from datetime import timedelta
import os
import dj_database_url


#   configuração do logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} <{module}> \'{message}\'',
            'style': '{',
        },
        'simple': {
            'format': '[{asctime}] {levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'api': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}


#   diretório base do backend
BASE_DIR = Path(__file__).resolve().parent.parent

#   chave secreta para o token de autenticação
#   @ver `.env`
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key")

#   modo de desenvolvimento
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"

#   host permitido
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    ".fly.dev",
]

#   aplicativos instalados
INSTALLED_APPS = [
    #   base do django/backend
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    #   headers para o frontend
    "corsheaders",

    #   framework REST para a API do backend
    "rest_framework",
    
    #   API para o backend (sala-de-leitura)
    "api",
]

#   framework REST
REST_FRAMEWORK = {
    #   Classe de autenticação customizada para lidar com cookies HTTPS
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "api.authentication.cookie_jwt.CookieJWTAuthentication",
    ),
    
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

#   configuração do JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    # CORS deve vir ANTES de CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",

]

#  Cross-Origin Resource Sharing (CORS)
CORS_ALLOW_CREDENTIALS = True

#   Define as origens permitidas
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://sala-de-leitura.com",  #   domínio fantasia
    "https://*.fly.dev",            #   domínio produção (testes)
]

#   Cross-Site Request Forgery (CSRF)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://sala-de-leitura.com",
    "https://*.fly.dev",
]

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG


SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default="postgres://app_user:app_password@db:5432/app_db",
        conn_max_age=600,
    )
}

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

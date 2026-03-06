# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api.views.Livro import LivroViewSet
from api.views.Emprestimo import EmprestimoViewSet
from api.views.Associado import AssociadoViewSet
from api.views.Diagnostico import DiagnosticoView, LivrosDiagnosticoView


router = DefaultRouter()
router.register("livros",      LivroViewSet,      basename="livro")
router.register("emprestimos", EmprestimoViewSet, basename="emprestimo")
router.register("associados",  AssociadoViewSet,  basename="associado")


urlpatterns = [
    # API REST (ViewSets)
    path("", include(router.urls)),

    # Autenticação (login, logout, refresh, me)
    path("auth/", include("api.urls_auth")),

    # Diagnóstico
    path("diagnostico/",        DiagnosticoView.as_view(),       name="diagnostico"),
    path("diagnostico/livros/", LivrosDiagnosticoView.as_view(), name="diagnostico-livros"),
]
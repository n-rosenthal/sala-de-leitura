# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

#   viewsets para os modelos de dados
from api.views.Livro import LivroViewSet
from api.views.Emprestimo import EmprestimoViewSet
from api.views.Associado import AssociadoViewSet

#   views para autenticação (login, logout, refresh token)
from api.views.Auth import login_view, logout_view, refresh_view

#   view para usuário atual/minha conta; meus empréstimos
from api.views.Me import me_view, emprestimos_me_view

#   view para o dashboard para gerentes/gerenciamento da sala de leitura
from api.views.Dashboard import DashboardView

#   view para diagnósticos sobre os objetos ({livro, empréstimo, associado}) da sala de leitura
from api.views.Diagnostico import DiagnosticoView


router = DefaultRouter()
router.register("livros", LivroViewSet, basename="livro")
router.register("emprestimos", EmprestimoViewSet, basename="emprestimo")
router.register("associados", AssociadoViewSet, basename="associado")


urlpatterns = [
    # API REST (ViewSets)
    path("", include(router.urls)),
    
    #   meus empréstimos
    path("emprestimos/me/", emprestimos_me_view, name="emprestimos-me"),


    # AUTH
    path("auth/login/",     login_view,     name="api-login"),
    path("auth/logout/",    logout_view,    name="api-logout"),
    path("auth/refresh/",   refresh_view,   name="api-refresh"),
    path("auth/me/",        me_view,        name="api-me"),


    # OUTROS
    path("dashboard/", DashboardView.as_view(), name="api-dashboard"),
    path("diagnostico/", DiagnosticoView.as_view(), name="diagnostico"),
]

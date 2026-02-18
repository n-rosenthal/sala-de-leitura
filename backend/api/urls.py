# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

#   viewsets para os modelos de dados
from api.views.Livro import LivroViewSet
from api.views.Emprestimo import EmprestimoViewSet
from api.views.Associado import AssociadoViewSet


#   view para diagnósticos sobre os objetos ({livro, empréstimo, associado}) da sala de leitura
from api.views.Diagnostico import DiagnosticoView


router = DefaultRouter()
router.register("livros", LivroViewSet, basename="livro")
router.register("emprestimos", EmprestimoViewSet, basename="emprestimo")
router.register("associados", AssociadoViewSet, basename="associado")


urlpatterns = [
    # API REST (ViewSets)
    path("", include(router.urls)),
    
    # OUTROS
    path("diagnostico/", DiagnosticoView.as_view(), name="diagnostico"),
]

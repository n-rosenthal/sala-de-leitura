# backend/api/views/Dashboard.py

from datetime import date

from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models import Livro, Emprestimo, Associado


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoje = date.today()

        data = {
            "livros": {
                "total": Livro.objects.count(),
                "disponiveis": Livro.objects.filter(
                    status=Livro.Status.DISPONIVEL
                ).count(),
                "emprestados": Livro.objects.filter(
                    status=Livro.Status.EMPRESTADO
                ).count(),
            },
            "emprestimos": {
                "ativos": Emprestimo.objects.filter(
                    data_devolucao__isnull=True
                ).count(),
                "atrasados": Emprestimo.objects.filter(
                    data_devolucao__isnull=True,
                    data_devolucao__lt=hoje,
                ).count(),
            },
            "associados": {
                "total": Associado.objects.count(),
                "ativos": Associado.objects.filter(
                    esta_ativo=True
                ).count(),
            },
        }

        return Response(data)

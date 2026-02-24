"""
    `backend/api/views/Diagnostico.py`
    
    Exibe dados sobre os outros modelos do sistema e executa métodos de verificação de consistência dos dados.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from api.models import Livro, Emprestimo, Associado

class DiagnosticoView(APIView):
    permission_classes = [AllowAny()]
    
    def get(self, request):
        """Retorna diagnóstico de inconsistências no sistema"""
        livros      = {
            'count': Livro.objects.all(),
            'disponiveis': Livro.objects.filter(status='DISPONIVEL'),
            'emprestados': Livro.objects.filter(status='EMPRESTADO')
        }

        associados  = {
            'count': Associado.objects.all(),
            'ativos': Associado.objects.filter(is_active=True),
            'inativos': Associado.objects.filter(is_active=False)
        }
        
        emprestimos  = {
            'count': Emprestimo.objects.all(),
            'ativos': Emprestimo.objects.filter(data_devolucao__isnull=True),
            'devolvidos': Emprestimo.objects.filter(data_devolucao__isnull=False)
        }
        
        return Response({
            'livros': livros,
            'associados': associados,
            'emprestimos': emprestimos
        })
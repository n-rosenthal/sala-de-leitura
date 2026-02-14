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
        livros      = Livro.objects.all()
        associados  = Associado.objects.all()
        emprestimos = Emprestimo.objects.all()
        
        return Response({
            'livros': {
                'count' : len(livros)
            },

            'associados': {
                'count': len(associados)
            },

            'emprestimos': {
                'count': len(emprestimos)
            }
        })
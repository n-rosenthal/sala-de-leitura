# api/views/Diagnostico.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from api.models import Livro, Emprestimo

class DiagnosticoView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Retorna diagnóstico de inconsistências no sistema"""
        livros = Livro.objects.all()
        inconsistencias = []
        
        for livro in livros:
            emprestimos_ativos = Emprestimo.objects.filter(
                livro=livro,
                data_devolucao__isnull=True
            ).count()
            
            if livro.status == Livro.Status.DISPONIVEL and emprestimos_ativos > 0:
                inconsistencias.append({
                    'tipo': 'STATUS_DISPONIVEL_COM_EMPRESTIMOS_ATIVOS',
                    'livro_id': livro.id,
                    'livro_titulo': livro.titulo,
                    'status_atual': livro.status,
                    'emprestimos_ativos': emprestimos_ativos,
                    'sugestao': 'Atualizar status para EMPRESTADO'
                })
            elif livro.status == Livro.Status.EMPRESTADO and emprestimos_ativos == 0:
                inconsistencias.append({
                    'tipo': 'STATUS_EMPRESTADO_SEM_EMPRESTIMOS_ATIVOS',
                    'livro_id': livro.id,
                    'livro_titulo': livro.titulo,
                    'status_atual': livro.status,
                    'emprestimos_ativos': emprestimos_ativos,
                    'sugestao': 'Atualizar status para DISPONIVEL'
                })
        
        return Response({
            'total_livros': livros.count(),
            'inconsistencias': inconsistencias,
            'total_inconsistencias': len(inconsistencias)
        })
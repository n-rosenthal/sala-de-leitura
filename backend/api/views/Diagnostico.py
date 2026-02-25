"""
    `backend/api/views/Diagnostico.py`
    
    Exibe dados sobre os outros modelos do sistema e executa métodos de verificação de consistência dos dados.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from api.models import Livro, Emprestimo, Associado
from django.db.models import Count, Q
from datetime import datetime
from rest_framework import status


class DiagnosticoView(APIView):
    """
    View para diagnóstico e análise de dados do sistema.
    Fornece estatísticas e verificações de consistência.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Retorna diagnóstico completo do sistema.
        Suporta parâmetros de consulta para filtrar dados específicos.
        
        Parâmetros:
            - tipo: 'livros', 'associados', 'emprestimos' ou 'todos' (padrão)
        """
        tipo = request.query_params.get('tipo', 'todos')
        
        response_data = {}
        
        if tipo in ['livros', 'todos']:
            response_data['livros'] = self._get_livros_stats()
            
        if tipo in ['associados', 'todos']:
            response_data['associados'] = self._get_associados_stats()
            
        if tipo in ['emprestimos', 'todos']:
            response_data['emprestimos'] = self._get_emprestimos_stats()
            
        # Adiciona verificações de consistência
        if tipo == 'todos':
            response_data['inconsistencias'] = self._check_inconsistencias()
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def _get_livros_stats(self):
        """Retorna estatísticas detalhadas sobre livros"""
        livros = Livro.objects.all()
        
        # Estatísticas básicas
        stats = {
            'count': livros.count(),
            'disponiveis': livros.filter(status='DISPONIVEL').count(),
            'emprestados': livros.filter(status='EMPRESTADO').count(),
        }
        
        # Adiciona outros status se existirem no modelo
        if livros.exists():
            # Pega todos os status únicos presentes nos dados
            status_counts = livros.values('status').annotate(total=Count('status'))
            for item in status_counts:
                if item['status'] and item['status'] not in ['DISPONIVEL', 'EMPRESTADO']:
                    # Converte para minúsculas e substitui espaços por underscore
                    status_key = item['status'].lower().replace(' ', '_')
                    stats[status_key] = item['total']
        
        # Estatísticas por título
        titulos_stats = []
        for titulo_data in livros.values('titulo').annotate(
            total=Count('id'),
            disponiveis=Count('id', filter=Q(status='DISPONIVEL'))
        ).order_by('titulo'):
            if titulo_data['titulo']:  # Verifica se o título não é nulo
                titulos_stats.append({
                    'titulo': titulo_data['titulo'],
                    'total_copias': titulo_data['total'],
                    'copias_disponiveis': titulo_data['disponiveis']
                })
        
        stats['por_titulo'] = titulos_stats
        
        return stats
    
    def _get_associados_stats(self):
        """Retorna estatísticas detalhadas sobre associados"""
        associados = Associado.objects.all()
        
        stats = {
            'count': associados.count(),
        }
        
        # Tenta obter campo ativo se existir
        try:
            if hasattr(Associado, 'ativo'):
                stats['ativos'] = associados.filter(ativo=True).count()
                stats['inativos'] = associados.filter(ativo=False).count()
        except:
            pass
        
        # CORREÇÃO: Usando o related_name correto 'emprestimos' (plural)
        try:
            stats['com_emprestimos'] = Associado.objects.filter(
                emprestimos__isnull=False
            ).distinct().count()
        except:
            # Fallback para o nome padrão se o related_name não estiver definido
            stats['com_emprestimos'] = Associado.objects.filter(
                emprestimo__isnull=False
            ).distinct().count()
        
        return stats
    
    def _get_emprestimos_stats(self):
        """Retorna estatísticas detalhadas sobre empréstimos"""
        emprestimos = Emprestimo.objects.all()
        
        stats = {
            'count': emprestimos.count(),
            'ativos': emprestimos.filter(data_devolucao__isnull=True).count(),
            'devolvidos': emprestimos.filter(data_devolucao__isnull=False).count(),
        }
        
        # Calcula empréstimos atrasados
        try:
            hoje = datetime.now().date()
            stats['atrasados'] = emprestimos.filter(
                data_devolucao__isnull=True,
                data_prevista_devolucao__lt=hoje
            ).count()
        except:
            stats['atrasados'] = 0
        
        return stats
    
    def _check_inconsistencias(self):
        """Verifica inconsistências nos dados"""
        inconsistencias = []
        
        # Verifica livros com status EMPRESTADO mas sem empréstimo ativo
        try:
            livros_emprestados = Livro.objects.filter(status='EMPRESTADO')
            
            if livros_emprestados.exists():
                emprestimos_ativos = Emprestimo.objects.filter(
                    data_devolucao__isnull=True
                ).values_list('livro_id', flat=True)
                
                livros_com_status_inconsistente = livros_emprestados.exclude(
                    id__in=emprestimos_ativos
                )
                
                for livro in livros_com_status_inconsistente:
                    inconsistencias.append({
                        'tipo': 'status_inconsistente',
                        'descricao': f'Livro {livro.titulo} ({livro.id}) está marcado como EMPRESTADO mas não possui empréstimo ativo',
                        'objeto': 'livro',
                        'id': livro.id
                    })
        except Exception as e:
            inconsistencias.append({
                'tipo': 'erro_verificacao',
                'descricao': f'Erro ao verificar inconsistências: {str(e)}',
                'objeto': 'sistema'
            })
        
        return inconsistencias


class LivrosDiagnosticoView(APIView):
    """
    View específica para diagnóstico de livros.
    URL: /api/diagnostico/livros/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Retorna todos os livros agrupados por título.
        Cada título contém uma lista de ides das cópias.
        """
        try:
            livros = Livro.objects.all().order_by('titulo', 'id')
            result = {}
            
            for livro in livros:
                if livro.titulo not in result:
                    result[livro.titulo] = {
                        'total_copias': 0,
                        'copias_disponiveis': 0,
                        'ides': []
                    }
                
                result[livro.titulo]['ides'].append({
                    'id': livro.id,
                    'status': livro.status
                })
                result[livro.titulo]['total_copias'] += 1
                
                if livro.status == 'DISPONIVEL':
                    result[livro.titulo]['copias_disponiveis'] += 1
            
            return Response({
                'status': 'success',
                'total_titulos': len(result),
                'total_copias': livros.count(),
                'dados': result
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# api/middleware/consistencia_middleware.py

import logging
from django.utils.deprecation import MiddlewareMixin
from api.models import Livro

logger = logging.getLogger('api')

class ConsistenciaMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Verifica apenas em modo de desenvolvimento
        if settings.DEBUG and request.path.startswith('/api/'):
            # Verifica inconsistências críticas
            livros_inconsistentes = []
            
            # Livros com status EMPRESTADO mas sem empréstimos ativos
            livros_emprestados = Livro.objects.filter(status=Livro.Status.EMPRESTADO)
            for livro in livros_emprestados:
                if not livro.get_emprestimo_ativo():
                    livros_inconsistentes.append(livro.id)
            
            if livros_inconsistentes:
                logger.warning(
                    f"Inconsistência detectada: Livros marcados como EMPRESTADO "
                    f"mas sem empréstimos ativos: {livros_inconsistentes}"
                )
        
        return response
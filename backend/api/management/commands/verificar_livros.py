"""
    `backend/api/management/commands/verificar_livros.py`
    
    Comando para verificar a consistência dos status dos livros
"""

from django.core.management.base import BaseCommand
from api.models import Livro

class Command(BaseCommand):
    help = 'Verifica a consistência dos status dos livros'
    
    def handle(self, *args, **options):
        """
        Verifica a consistência dos status dos livros.

        Mostra uma lista de inconsistências encontradas nos livros.

        Exemplo de saída:
        (!!)  Encontradas 2 inconsistências em 10 livros:
            - Livro 1: Status DISPONIVEL mas tem 1 empréstimo ativo
            - Livro 2: Status EMPRESTADO mas não tem empréstimos ativos
        """
        
        livros = Livro.objects.all()
        total = livros.count()
        inconsistencias = []
        
        for livro in livros:
            status = livro.verificar_consistencia()
            if not status['consistente']:
                inconsistencias.append(status)
        
        if inconsistencias:
            self.stdout.write(
                self.style.WARNING(
                    f'(!!)  Encontradas {len(inconsistencias)} inconsistências em {total} livros:'
                )
            )
            for inc in inconsistencias:
                self.stdout.write(f"  - Livro {inc['livro_id']}: {', '.join(inc['inconsistencias'])}")
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Todos os {total} livros estão consistentes!')
            )
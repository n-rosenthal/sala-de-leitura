"""
    `backend/api/management/commands/corrigir_inconsistencias.py`
    
    Comando para corrigir inconsistências entre status de livros e empréstimos ativos
"""
#   Comando base
from django.core.management.base import BaseCommand

#   Modelos
from api.models import Livro, Emprestimo


class Command(BaseCommand):
    help = 'Corrige inconsistências entre status de livros e empréstimos ativos'
    
    def handle(self, *args, **options):
        livros = Livro.objects.all()
        total_corrigidos = 0
        
        for livro in livros:
            emprestimos_ativos = Emprestimo.objects.filter(
                livro=livro,
                data_devolucao__isnull=True
            ).count()
            
            # Caso 1: Status DISPONIVEL mas tem empréstimos ativos
            if livro.status == Livro.Status.DISPONIVEL and emprestimos_ativos > 0:
                livro.status = Livro.Status.EMPRESTADO
                livro.save()
                self.stdout.write(
                    f"✅ Corrigido: {livro.id} - {livro.titulo} "
                    f"(DISPONIVEL → EMPRESTADO, {emprestimos_ativos} empréstimo(s) ativo(s))"
                )
                total_corrigidos += 1
            
            # Caso 2: Status EMPRESTADO mas não tem empréstimos ativos
            elif livro.status == Livro.Status.EMPRESTADO and emprestimos_ativos == 0:
                livro.status = Livro.Status.DISPONIVEL
                livro.save()
                self.stdout.write(
                    f"✅ Corrigido: {livro.id} - {livro.titulo} "
                    f"(EMPRESTADO → DISPONIVEL, 0 empréstimos ativos)"
                )
                total_corrigidos += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Total de livros corrigidos: {total_corrigidos}'
            )
        )
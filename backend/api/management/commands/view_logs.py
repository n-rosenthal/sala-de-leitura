# api/management/commands/view_logs.py

from django.core.management.base import BaseCommand
import os
from pathlib import Path

class Command(BaseCommand):
    help = 'Exibe os logs recentes da aplicação'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--lines',
            type=int,
            default=50,
            help='Número de linhas a exibir (padrão: 50)'
        )
    
    def handle(self, *args, **options):
        log_file = Path('logs/application.log')
        
        if not log_file.exists():
            self.stdout.write(self.style.ERROR('Arquivo de log não encontrado'))
            return
        
        with open(log_file, 'r') as f:
            lines = f.readlines()
        
        # Mostra apenas linhas de AUDIT_LOG
        audit_lines = [line for line in lines if 'AUDIT_LOG' in line]
        
        n_lines = options['lines']
        recent_lines = audit_lines[-n_lines:] if len(audit_lines) > n_lines else audit_lines
        
        self.stdout.write(self.style.SUCCESS(f'=== ÚLTIMOS {len(recent_lines)} LOGS DE AUDITORIA ==='))
        
        for line in recent_lines:
            # Extrai apenas a parte JSON do log
            if 'AUDIT_LOG:' in line:
                log_data = line.split('AUDIT_LOG:')[1].strip()
                self.stdout.write(f"{log_data}\n")
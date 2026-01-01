#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seu_projeto.settings')
django.setup()

from django.core.management import call_command

def main():
    print("Carregando fixtures...")
    
    fixtures = [
        'users.json',
        'associados.json', 
        'livros.json',
        'livros2.json',
        'emprestimos.json'
    ]
    
    for fixture in fixtures:
        print(f"Carregando {fixture}...")
        try:
            call_command('loaddata', fixture)
            print(f"✓ {fixture} carregado com sucesso!")
        except Exception as e:
            print(f"✗ Erro ao carregar {fixture}: {e}")
    
    print("\n✅ Todas as fixtures foram carregadas!")

if __name__ == '__main__':
    main()

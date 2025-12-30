#!/bin/bash

# Cria diretório de logs se não existir
mkdir -p /app/logs
chmod 755 /app/logs

# Executa migrações do banco de dados
python manage.py migrate --noinput

# Coleta arquivos estáticos (se estiver usando)
python manage.py collectstatic --noinput --clear || true

# Inicia o servidor
exec "$@"
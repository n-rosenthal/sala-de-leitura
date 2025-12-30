# backend/Dockerfile

FROM python:3.12

WORKDIR /app

# Cria diretório de logs antes de copiar qualquer coisa
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código
COPY . .

# Comando para iniciar
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

---

# 3️⃣ Pipeline de deploy — `docs/DEPLOY.md`

```md
# 🚀 Pipeline de Deploy

Este documento descreve o processo de deploy do backend e frontend.

---

## 🐳 Backend (Django + Fly.io)

### Docker

```dockerfile
CMD ["gunicorn", "--bind", ":8000", "core.wsgi"]

Deploy no Fly.io
fly launch
fly deploy

Migrações automáticas
[deploy]
  release_command = "python manage.py migrate --noinput"

Variáveis de ambiente (secrets)
fly secrets set \
  SECRET_KEY=... \
  DATABASE_URL=... \
  DJANGO_DEBUG=0

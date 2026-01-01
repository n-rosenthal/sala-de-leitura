
---

# 2️⃣ README de arquitetura — `docs/ARCHITECTURE.md`

```md
# 🧠 Arquitetura de Autenticação e Segurança

Este documento descreve a arquitetura de autenticação, uso de cookies e separação de responsabilidades entre frontend e backend.

---

## 🔐 Modelo de Autenticação

A aplicação utiliza **JWT armazenado em cookies HTTP-only**.

### Cookies utilizados

| Cookie         | Finalidade              |
|---------------|-------------------------|
| access_token  | Autorização de requests |
| refresh_token | Renovação do access     |

### Propriedades de segurança

```python
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "Lax"


🔄 Fluxo de Login

Usuário envia credenciais para /api/auth/login/

Backend valida e retorna cookies

Frontend não acessa tokens via JS

Requests autenticadas usam cookies automaticamente

🛡️ Proteção de Rotas no Frontend

Middleware do Next.js intercepta rotas protegidas

Verifica presença do cookie access_token

Redireciona para /login se ausente

if (!req.cookies.get("access_token")) {
  return redirect("/login");
}

🔍 Verificação de Sessão

Endpoint backend:

GET /api/auth/me/


Usado para:

Restaurar sessão

Exibir dados do usuário

Confirmar autenticação

📦 Separação de Responsabilidades
Camada	Responsabilidade
Frontend	UX, rotas, middleware
Backend	Auth, regras de negócio
Infra	HTTPS, containers
🔒 HTTPS e Cookies Secure

Em produção, Secure=True é obrigatório

HTTPS garantido pelo Fly.io

Cookies não funcionam em HTTP com Secure=True
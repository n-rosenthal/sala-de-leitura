# 📚 Sala de Leitura

Sistema web para **gestão de biblioteca e empréstimos**, desenvolvido como projeto full-stack com foco em **boas práticas de arquitetura, autenticação segura e deploy em produção**.

O sistema permite:
- Gerenciar livros
- Controlar empréstimos
- Administrar associados
- Autenticação segura baseada em cookies HTTP-only

---

## 🧱 Arquitetura Geral

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js (App Router)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT via cookies HTTP-only
- **Infraestrutura**:
  - Backend: Fly.io
  - Frontend: (Vercel ou Fly.io)
  - HTTPS automático
  - Containers Docker

---

## 🔐 Autenticação

- Login gera **access_token** e **refresh_token**
- Tokens armazenados em cookies:
  - `HttpOnly`
  - `Secure` (produção)
  - `SameSite=Lax`
- Middleware no frontend protege rotas privadas
- Backend valida token em `/api/auth/me/`

📄 Detalhes completos em: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 🚀 Deploy

- Backend containerizado com Docker
- Deploy contínuo via Fly.io
- Migrações automáticas no deploy
- HTTPS obrigatório

📄 Pipeline detalhado em: [`docs/DEPLOY.md`](docs/DEPLOY.md)

---

## 🧪 Desenvolvimento local

```bash
docker-compose up --build

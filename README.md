# Sala de Leitura
---

Sistema web para **gestão de uma sala de leitura**. O sistema ainda está em desenvolvimento e muitas componentes precisam de ajustes ou de refatoração. Atualmente, o sistema:

- permite a criação e o controle de `Associados` à sala de leitura
- permite a gerência e a visualização dos `Livros` da sala de leitura
- realize empréstimos e devolução destes `Livros` aos `Associados`.

Além disso,

- possui subsistemas de auditoria (para verificação de validade/corretude dos livros e empréstimos)
- logging, para verificação das ações ocorridas na aplicação.

O sistema está sendo desenvolvido utilizando PostgreSQL como banco de dados. No backend, Python está sendo usada enquanto linguagem de programação, e Django para manejar o banco de dados e enquanto API REST. No frontend, as componentes são definidas em TypeScript, usando React como base. Next.js é a framework para roteamento do frontend. Tanto o backend quanto o frontend são construídos em contâiners Docker.

## Importante
Leia os demais documentos da documentação em construção em `documentação/`.

### Estado do Projeto
O projeto está em desenvolvimento. Abaixo estão todas as rotas possíveis do projeto, para serem visualizadas:

autenticação
1. `/login`:		página de login

página inicial
2. `/me`:		página 'Minha Conta/Meu Perfil'; associados normais são direcionados para cá, após o login
3. `/dashboard`:	página de dashboard para gerentes; associados gerentes são direcionados para cá, após o login

domínio da aplicação
4. `/associados`:	página de exibição de todos os associados
5. `/livros`:		página de exibição de todos os livros
6. `/emprestimos`:	página de exibição de todos os empréstimos

4.1. `associados/[id]`: detalhes do associado de id `[id]`
4.2. `associados/[id]/editar`: editar detalhes deste associado
4.3. `associados/novo`: registrar novo associado

5.1. `livros/[id]`: detalhes do livro de id `[id]`
5.2. `livros/[id]/editar`: editar detalhes deste livro
5.3. `livros/[id]emprestar`: emprestar este livro
5.4. `livros/novo`: registrar novo livro

6.1. `emprestimos/[id]`: detalhes do emprestimo de id `[id]`
6.2. `emprestimos/[id]/devolver`: devolver o empréstimo
6.3. `emprestimos/novo`: registrar novo empréstimo


implementados parcialmente ou não ainda implementados
7. `/diagnostico`: executa e exibe testes de verificação e validação sobres os dados do banco

8. `/auditoria`: exibe os *logs* do sistema

9. `associados/[id]/relatorio`: exibe o relatório de empréstimos (ativos, histórico) de um associado

10. `dashboard/relatorio`: produz relatório global sobre o estado e o histórico da sala de leitura



---

## Arquitetura Geral

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js (App Router)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT via cookies HTTP-only
- **Infraestrutura**:
  - Backend: Fly.io
  - Frontend: (Vercel ou Fly.io)
  - HTTPS automático
  - Containers Docker

Para maiores detalhes das arquiteturas, ver
1. `documentação/backend/arquitetura.md`
2. `documentação/frontend/arquitetura.md`

---

## Autenticação

- Login gera **access_token** e **refresh_token**
- Tokens armazenados em cookies:
  - `HttpOnly`
  - `Secure` (produção)
  - `SameSite=Lax`
- Middleware no frontend protege rotas privadas
- Backend valida token em `/api/auth/me/`

Veja também `documentação/autenticação.md`

---

## Deploy

O foco atual de deploy do projeto é sua visualização e testes de integração. O sistema não está em estágio de produção, nem está pronto para ter usuários reais.

- Backend containerizado com Docker
- Deploy contínuo via Fly.io
- Migrações automáticas no deploy
- HTTPS obrigatório


---

## Desenvolvimento local

Para compôr e servir localmente o projeto, é necessário construir os contâiners:

```bash
docker-compose up --build
```

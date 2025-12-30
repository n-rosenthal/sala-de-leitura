#   $\S 2.$ Autenticação e Login
## $\S 2.1.$ Estrutura de Arquivos

```bash
app/(public)/login/
├── page.tsx              ← composição
├── LoginForm.tsx         ← UI + estado
├── useLogin.ts           ← lógica
└── error.tsx

Browser
 └── Cookies (HttpOnly)
       └── access_token
       └── refresh_token

Next.js
 ├── middleware.ts      ← valida presença do cookie
 ├── (protected)/layout ← valida no servidor
 └── UI (AuthContext)   ← estado visual apenas

Django
 ├── POST /api/auth/login
 ├── POST /api/auth/logout
 └── GET  /api/auth/me

```

---
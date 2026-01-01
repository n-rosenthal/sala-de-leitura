#   5. Fluxo de Autenticação para o 

- Autenticação baseada em **JWT**
- Dois tokens:
  - **Access Token** (curta duração)
  - **Refresh Token** (longa duração)
- Controle de acesso baseado em **permissões e papéis (RBAC)**
- Tokens enviados via  cookies HTTPS-only


Este diagrama mostra a interação entre frontend, backend e serviços internos durante o login. Tanto o fluxo normal quanto possíveis erros (cenários alternativos) são auditados no backend (logs).

```bash
Frontend        AuthView        Django Auth       AuditService
   │               │                 │                   │
   │ POST /login   │                 │                   │
   │──────────────▶│                 │                   │
   │ {user, pass}  │ authenticate()  │                   │
   │               │───────────────▶ │                   │
   │               │                 │                   │
   │               │     User válido?│                   │
   │               │◀─────────────── │                   │
   │               │                 │                   │
   │               │ login(request)  │                   │
   │               │───────────────▶ │                   │
   │               │                 │                   │
   │               │ log action      │                   │
   │               │───────────────────────────────────▶ │
   │               │                 │                   │
   │               │ 200 OK          │                   │
   │◀──────────────│ {user data}     │                   │
   │               │                 │                   │
   │ Guarda token  │                 │                   │
   │──────────────▶│                 │                   │
```

---
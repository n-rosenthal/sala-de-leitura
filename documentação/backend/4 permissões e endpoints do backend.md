#   4. Permissões e endpoints do backend

| Endpoint            | Método      | Descrição                            | Autenticação | Permissão                                        |
| ------------------- | ----------- | ------------------------------------ | ------------ | ------------------------------------------------ |
| `/api/auth/login/`  | POST        | Autenticação do usuário              | ❌ Não        | `AllowAny`                                       |
| `/api/auth/logout/` | POST        | Logout do usuário                    | ✅ Sim        | `IsAuthenticated`                                |
| `/api/me/`          | GET         | Retorna dados do usuário autenticado | ✅ Sim        | `IsAuthenticated`                                |
| `/api/livros/`      | GET         | Lista livros cadastrados             | ✅ Sim        | `IsAuthenticated`                                |
| `/api/livros/novo/`      | POST        | Cria novo livro                      | ✅ Sim        | `IsAuthenticated` *(ou `IsGerente` se aplicado)* |
| `/api/livros/{id}/` | PUT / PATCH | Atualiza dados de um livro           | ✅ Sim        | `IsAuthenticated` *(ou `IsGerente`)*             |
| `/api/livros/{id}/` | DELETE      | Remove um livro                      | ✅ Sim        | `IsGerente`                                      |
| `/api/emprestimos/` | GET         | Lista empréstimos                    | ✅ Sim        | `IsAuthenticated`                                |
| `/api/emprestimos/novo/` | POST        | Cria empréstimo                      | ✅ Sim        | `IsAuthenticated`                                |
| `/api/associados/`  | GET         | Lista associados                     | ✅ Sim        | `IsGerente`                                      |
| `/api/associados/novo/`  | POST        | Cria associado                       | ✅ Sim        | `IsGerente`                                      |
| `/api/dashboard/`   | GET         | Dados agregados do sistema           | ✅ Sim        | `IsGerente`                                      |
| `/api/diagnostico/` | GET         | Diagnóstico e integridade do sistema | ✅ Sim        | `IsGerente`                                      |

---

##  4.1. Diagrama (Fluxo de Autenticação)

```bash
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ POST /api/auth/login/
       │ { username, password }
       ▼
┌──────────────────────────┐
│        AuthView          │
│  (AllowAny)              │
└─────────┬────────────────┘
          │ authenticate()
          ▼
┌──────────────────────────┐
│   Django Auth Backend    │
└─────────┬────────────────┘
          │
   ┌──────┴─────────┐
   │                │
   ▼                ▼
Usuário válido   Credenciais inválidas
   │                │
   │                └──► 401 / 403 + AUDIT_LOG
   ▼
login(request, user)
   │
   ▼
AUDIT_LOG: LOGIN_SUCESSO
   │
   ▼
Resposta 200 OK
(user_id, username, permissões)
   │
   ▼
Frontend armazena token/session
   │
   ▼
┌──────────────────────────┐
│ JWTAuthentication        │
│ IsAuthenticated, cookies │
└─────────┬────────────────┘
          ▼
┌──────────────────────────┐
│ View protegida           │
│ request.user disponível  │
└──────────────────────────┘
```

---
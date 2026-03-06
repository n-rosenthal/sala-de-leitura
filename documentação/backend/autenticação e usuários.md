## Estrutura dos Arquivos no Backend
Os arquivos envolvidos na autenticação de usuários no backend são:

```bash
api/
├── authentication/
│   └── cookie_jwt.py
├── middleware/
│   └── jwt_refresh.py
├── permissions/
│   └── roles.py
└── views/
    ├── Auth.py
    └── Me.py
```

e, no frontend,

```bash
services/api.ts
contexts/AuthContext.tsx
app/(protected)/layout.tsx
```

---
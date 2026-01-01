#   *Hooks* do frontend para acessar a API do backend
```bash
frontend/
├── hooks
    ├── audit
    │   └── index.ts
    ├── auth
    │   ├── index.ts
    │   ├── useAuth.ts
    │   └── useLogout.ts
    ├── core
    │   ├── index.ts
    │   └── usePaginated.ts
    ├── domain
    │   ├── associados
    │   │   ├── index.ts
    │   │   ├── useAssociadoMe.ts
    │   │   ├── useAssociados.ts
    │   │   ├── useAssociado.ts
    │   │   └── useUpdateAssociado.ts
    │   ├── emprestimos
    │   │   ├── index.ts
    │   │   ├── useCreateEmprestimo.ts
    │   │   ├── useDevolverEmprestimo.ts
    │   │   ├── useEmprestimosAtivos.ts
    │   │   ├── useEmprestimosMe.ts
    │   │   ├── useEmprestimos.ts
    │   │   ├── useEmprestimo.ts
    │   │   └── useRenovarEmprestimo.ts
    │   └── livros
    │       ├── index.ts
    │       ├── useLivros.ts
    │       └── useLivro.ts
    ├── index.ts
    ├── queryKeys
    │   ├── associadosKeys.ts
    │   ├── authKeys.ts
    │   ├── emprestimosKeys.ts
    │   ├── index.ts
    │   └── livrosKeys.ts
    └── utils
        ├── index.ts
        └── useDebounce.ts
```

*Hooks* são funções que permitem que os componentes do frontend se comuniquem com a API do backend.
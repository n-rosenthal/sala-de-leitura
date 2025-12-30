#   *Hooks* do frontend para acessar a API do backend
```bash
frontend/
├─ hooks/
│  ├─ auth/
│  │  └─ useAuth.ts
│  │
│  ├─ domain/
│  │  ├─ associados/
│  │  │  ├─ useAssociadoMe.ts
│  │  │  ├─ useAssociado.ts
│  │  │  └─ useAssociados.ts
│  │  │
│  │  ├─ livros/
│  │  │  ├─ useLivro.ts
│  │  │  └─ useLivros.ts
│  │  │
│  │  └─ emprestimos/
│  │     ├─ useEmprestimo.ts
│  │     └─ useEmprestimos.ts
│  │
│  └─ core/
│     └─ usePaginated.ts
```

*Hooks* são funções que permitem que os componentes do frontend se comuniquem com a API do backend.
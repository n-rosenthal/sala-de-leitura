# Arquitetura Front-end — Sala de Leitura

> **Stack:** Next.js · TypeScript · TailwindCSS · HeroUI · TanStack Query · Framer Motion  
> **Última atualização:** março 2026

---

## Índice

1. [Visão geral](#1-visão-geral)
2. [Mapa de módulos](#2-mapa-de-módulos)
3. [Módulos em detalhe](#3-módulos-em-detalhe)
4. [Fluxo de dados](#4-fluxo-de-dados)
5. [Melhorias e sugestões](#5-melhorias-e-sugestões)
6. [Git — branch de autenticação](#6-git--branch-de-autenticação)

---

## 1. Visão geral

O front-end segue a arquitetura **App Router** do Next.js com separação clara entre camadas:

```
UI (components)
  └── Lógica de negócio (hooks)
        └── Acesso a dados (services)
              └── HTTP (services/api.ts)
                    └── Backend Django/DRF
```

A autenticação usa **JWT armazenado em cookies HttpOnly**, lido pelo backend. O front-end nunca toca diretamente no token — apenas envia cookies automaticamente via `credentials: "include"`.

---

## 2. Mapa de módulos

```
frontend/
│
├── app/                        → Rotas (Next.js App Router)
│   ├── layout.tsx              → Layout raiz, monta os Providers
│   ├── loading.tsx             → Fallback global de carregamento
│   ├── (protected)/            → Grupo de rotas autenticadas
│   └── (public)/               → Grupo de rotas públicas (login, cadastro)
│
├── components/                 → Componentes React reutilizáveis
│   ├── auth/                   → Componentes exclusivos de autenticação
│   ├── AuthBoundary.tsx        → Proteção declarativa de rotas no cliente
│   ├── domain/                 → Componentes de domínio (Livro, Empréstimo…)
│   ├── forms/                  → Formulários genéricos/reutilizáveis
│   ├── layout/                 → Header, Sidebar, Footer, etc.
│   ├── skeletons/              → Placeholders de carregamento (Skeleton UI)
│   └── ui/                     → Primitivos de UI (Button, Modal, Badge…)
│
├── contexts/
│   └── AuthContext.tsx         → Estado global de autenticação (user, login, logout)
│
├── hooks/                      → Lógica de negócio encapsulada em hooks
│   ├── auth/                   → useAuth, useSession, etc.
│   ├── audit/                  → Hooks de rastreamento/auditoria
│   ├── core/                   → Hooks utilitários genéricos
│   ├── domain/                 → Hooks de domínio (useLivros, useEmprestimos…)
│   ├── queryKeys/              → Fábricas de chaves do TanStack Query
│   ├── utils/                  → Hooks utilitários (useDebounce, etc.)
│   └── index.ts                → Re-exportações centralizadas
│
├── middleware.ts               → Proteção de rotas no Edge (Next.js)
│
├── providers/
│   ├── providers.tsx           → Composição de todos os Providers
│   └── index.tsx               → Re-exportação
│
├── services/                   → Camada de acesso a dados
│   ├── api.ts                  → Cliente HTTP base (fetch + refresh automático)
│   ├── auth.ts                 → Chamadas de autenticação (login, logout, refresh, me)
│   ├── livros.ts               → Chamadas de API para o domínio de Livros
│   ├── logger.ts               → Utilitário de logging estruturado
│   └── server-api.ts           → Cliente HTTP para Server Components (sem cookies de browser)
│
├── types/                      → Tipos TypeScript globais
│   ├── Associado.ts
│   ├── Emprestimo.ts
│   ├── Livro.ts
│   └── index.ts                → Re-exportações
│
├── queryClient.ts              → Instância global do TanStack QueryClient
└── styles/
    └── globals.css             → Estilos globais / variáveis CSS
```

---

## 3. Módulos em detalhe

### `app/`

Organizado em **Route Groups** do Next.js:

| Grupo | Descrição |
|---|---|
| `(protected)/` | Rotas que exigem login. O middleware redireciona para `/login` se o cookie estiver ausente. |
| `(public)/` | Rotas acessíveis sem autenticação (login, cadastro, landing). |

O `layout.tsx` raiz monta o `<Providers>` que envolve toda a aplicação.

---

### `components/`

| Pasta | Responsabilidade |
|---|---|
| `auth/` | Formulários e fluxos de login/logout/cadastro |
| `AuthBoundary.tsx` | Wrapper declarativo: renderiza filhos apenas se autenticado, caso contrário exibe fallback ou redireciona |
| `domain/` | Componentes acoplados ao domínio (ex: `LivroCard`, `EmprestimoRow`) |
| `forms/` | Campos, validações e layouts de formulário reutilizáveis |
| `layout/` | Estrutura visual da página (nav, sidebar, etc.) |
| `skeletons/` | Versões de carregamento dos componentes de domínio |
| `ui/` | Primitivos desacoplados do domínio (botões, badges, modais) |

---

### `contexts/AuthContext.tsx`

Gerencia o estado de autenticação globalmente:

- `user` — objeto do usuário autenticado (ou `null`)
- `loading` — `true` enquanto verifica a sessão ao montar
- `login(credentials)` — chama `services/auth.ts`, atualiza o estado
- `logout()` — invalida o token no backend, limpa o estado

Escuta o evento global `"auth:logout"` emitido pelo cliente HTTP quando o refresh falha, garantindo que o estado seja limpo mesmo em requisições de background.

---

### `hooks/`

| Pasta | Exemplos de hooks |
|---|---|
| `auth/` | `useAuth()` — interface pública do AuthContext |
| `domain/` | `useLivros()`, `useEmprestimo(id)` — TanStack Query |
| `queryKeys/` | Fábricas de chaves: `livrosKeys.list()`, `livrosKeys.detail(id)` |
| `core/` | `usePagination()`, `useModal()` |
| `utils/` | `useDebounce()`, `useLocalStorage()` |
| `audit/` | Hooks que registram ações do usuário via `services/logger.ts` |

O `index.ts` re-exporta tudo — os componentes importam apenas de `@/hooks`.

---

### `middleware.ts`

Executado no **Edge Runtime** antes de qualquer renderização. Verifica a presença do cookie `access_token`:

- **Rota protegida sem cookie** → redireciona para `/login?next=<destino>`
- **Rota pública com cookie** → redireciona para `/dashboard`

> ⚠️ O middleware verifica apenas a *presença* do cookie, não sua validade criptográfica. A validação real ocorre no backend a cada requisição.

---

### `providers/`

Compõe todos os providers em uma única árvore, mantendo o `app/layout.tsx` limpo:

```tsx
// providers/providers.tsx
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

### `services/`

| Arquivo | Responsabilidade |
|---|---|
| `api.ts` | `apiFetch()` — cliente HTTP base. Injeta `credentials: "include"`, trata 401 com refresh automático, emite `auth:logout` se o refresh falhar |
| `auth.ts` | `login()`, `logout()`, `refreshToken()`, `getMe()` — chamadas concretas de auth |
| `livros.ts` | CRUD de livros — usado pelos hooks de domínio |
| `logger.ts` | Logging estruturado (nível, contexto, timestamp) |
| `server-api.ts` | Versão de `apiFetch` para **Server Components**: passa cookies do request via `headers()` do Next.js, sem acesso ao `window` |

---

### `types/`

Contratos TypeScript dos modelos de domínio:

| Tipo | Campos principais |
|---|---|
| `Livro` | `id`, `titulo`, `autor`, `isbn`, `disponivel` |
| `Emprestimo` | `id`, `livro`, `associado`, `data_emprestimo`, `data_devolucao` |
| `Associado` | `id`, `nome`, `email`, `matricula` |

---

### `queryClient.ts`

Instância singleton do TanStack `QueryClient`, configurada com defaults globais (stale time, retry, etc.). Exportada para uso no Provider e em utilitários de prefetch.

---

## 4. Fluxo de dados

### Requisição autenticada típica

```
Componente
  └── useEmprestimos()                  [hooks/domain/]
        └── useQuery({ queryFn })       [TanStack Query]
              └── getEmprestimos()      [services/emprestimos.ts]
                    └── apiFetch(...)   [services/api.ts]
                          └── POST /api/emprestimos/
                                └── CookieJWTAuthentication  [Django]
```

### Refresh automático de token

```
apiFetch() → 401
  └── refreshToken()           [uma vez, chamadas paralelas são enfileiradas]
        ├── Sucesso → repete a requisição original
        └── Falha   → window.dispatchEvent("auth:logout")
                          └── AuthContext limpa user → middleware redireciona
```

---

## 5. Melhorias e sugestões

### 🔴 Crítico

**Centralizar re-exportações de `services/`**
Assim como `hooks/index.ts`, criar um `services/index.ts` para evitar imports diretos espalhados pelos hooks.

**Tipar o retorno de `apiFetch` nos services**
Cada função em `services/*.ts` deve declarar seu tipo de retorno explicitamente em vez de depender de inferência, evitando `any` silencioso.

---

### 🟡 Importante

**`queryKeys/` como objeto central**
Consolidar todas as chaves do TanStack Query em um único arquivo `queryKeys/index.ts` com fábricas tipadas, evitando strings mágicas duplicadas entre hooks.

**Separar `AuthBoundary` e `AuthGuard`**
`AuthBoundary.tsx` parece acumular responsabilidades de boundary de erro e proteção de rota. Separá-los torna cada um mais testável e reutilizável.

**`server-api.ts` merece documentação inline**
Server Components têm restrições específicas (sem `window`, cookies via `headers()`). Comentários claros evitam que futuros contribuidores usem `api.ts` no lugar errado.

---

### 🟢 Melhorias de qualidade

**Adicionar `zod` para validação de formulários e respostas de API**
Garante que os dados do backend correspondam aos tipos TypeScript em runtime, não apenas em compilação.

**Mover `queryClient.ts` para `providers/`**
Mantém a responsabilidade de configuração global concentrada na pasta de providers.

**Padronizar nomenclatura de hooks de domínio**
Adotar o padrão `use<Recurso>List` / `use<Recurso>Detail` / `use<Recurso>Mutation` facilita descoberta e evita nomes ambíguos como `useLivros` vs `useLivro`.

**Adicionar barrel exports em `components/ui/`**
Um `components/ui/index.ts` elimina imports longos como `@/components/ui/Button/Button`.

---

## 6. Git — branch de autenticação

### Situação: mudanças não commitadas

```bash
# 1. Verifica o que está pendente
git status

# 2. Commita tudo relacionado à autenticação
git add contexts/AuthContext.tsx \
        hooks/auth/ \
        services/auth.ts \
        services/api.ts \
        middleware.ts \
        components/auth/ \
        components/AuthBoundary.tsx

git commit -m "feat(auth): cookie-based JWT authentication

- AuthContext com login/logout e verificação de sessão
- apiFetch com refresh automático e fila de requisições paralelas
- middleware para proteção de rotas no edge
- AuthBoundary para proteção declarativa no cliente
- hooks/auth com useAuth público"

# 3. Vai para a main e atualiza
git checkout main
git pull origin main

# 4. Merge da branch de autenticação
git merge feat/authentication

# 5. Resolve conflitos se houver, depois:
# git add . && git commit

# 6. Sobe para o remoto
git push origin main

# 7. (Opcional) Remove a branch
git branch -d feat/authentication
git push origin --delete feat/authentication
```

### Situação alternativa: já commitado, só falta o merge

```bash
git checkout main
git pull origin main
git merge feat/authentication
git push origin main
```

### Dica: inspecionar o diff antes do merge

```bash
# Ver todos os arquivos que a branch modifica em relação à main
git diff main...feat/authentication --name-only

# Ver o diff completo
git diff main...feat/authentication
```
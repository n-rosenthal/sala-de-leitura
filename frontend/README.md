# Documentação do Frontend — Sala de Leitura
## Visão Geral

O frontend da aplicação para a sala de leitura está sendo desenvolvido em TypeScript, utilizando React e Next.js (App Router).
Ele consome uma API REST desenvolvida em Django, sendo responsável por:

- Autenticação e controle de sessão
- Navegação baseada em permissões (rotas para gerentes e rotas para usuários)
- Visualização e manipulação de entidades do domínio (livros, empréstimos e suas devoluções)

## Tecnologias

| Tecnologia           | Papel                           |
| -------------------- | ------------------------------- |
| Next.js (App Router) | Roteamento, layouts e rendering |
| React                | Composição de UI                |
| TypeScript           | Tipagem estática                |
| Tailwind CSS         | Estilização                     |
| TanStack Query       | Gerenciamento de dados remotos  |
| Axios / Fetch        | Comunicação com API             |
| Docker               | Containerização                 |

##  Rotas

- `/login`:		    página de login
- `/logout`:		rota de logout
- `/livros`:		página de livros
- `/livros/novo`:	página de criação de livro
- `/livros/[id]`:	página de detalhes de livro
- `/livros/[id]/editar`:	página de edição de livro
- `/emprestimos`:	página de empréstimos
- `/emprestimos/novo`:	página de criação de empréstimo
- `/emprestimos/[id]`:	página de detalhes de empréstimo
- `/emprestimos/[id]/devolver`:	página de devolução de empréstimo
- `/associados`:		página de associados
- `/associados/novo`:	página de criação de associado
- `/associados/[id]`:	página de detalhes de associado
- `/associados/[id]/editar`:	página de edição de associado
- `/associados/[id]/relatorio`:	página de relatório de empréstimos de um associado
- `/dashboard`:		página de dashboard
- `/diagnostico`:	página de diagnóstico

Somente `/login` é uma rota pública, atualmente. Não requer autenticação e é a página responsável por inicializar a sessão do usuário na aplicação. O acesso é controlado via middleware e AuthContext.

### Autenticação e Proteção de Rotas
Ver `contexts/AuthContext.tsx`

Responsável por:
- Armazenar o estado do usuário autenticado
- Fornecer dados como user, isAuthenticated, isGerente, login, logout

Esse contexto é consumido por componentes e hooks.

### Componentes de Proteção
`components/auth/RequireAuth.tsx`
- Envolve componentes ou layouts
- Garante que o usuário esteja autenticado
- Pode exibir loading ou redirecionar

`AuthBoundary.tsx`
- Boundary semântico para autenticação
- Centraliza tratamento de erro e fallback

## Comunicação com a API
### `services/`

Centraliza toda comunicação com o backend.

```bash
services/
├── api.ts        # Configuração base (axios/fetch)
├── auth.ts       # Login / logout / sessão
├── livros.ts     # Endpoints de livros
├── logger.ts     # Logs
└── server-api.ts # Uso em Server Components
```

As chamadas devem ser feitas pelos serviços à API, e não nos componentes.

### `hooks/`

```bash
hooks/
├── auth
├── domain
├── audit
├── core
└── utils
```

Responsáveis por:

- Encapsular lógica de dados
- Integrar TanStack Query
- Simplificar componentes

Os hooks são chamadas à API. Por exemplo, o hook para obter um livro de identificador `id`:

```tsx
/**
 * Hook para carregaar um `Livro` da API.
 * 
 * Recebe como parâmetro o identificador alfanumérico único de um livro.
 * Retorna os dados do livro, ou `null` se o livro nao for encontrado.
 * 
 * @param {string | null} id - O identificador alfanumérico único de um livro.
 * @returns {data: Livro | undefined, isLoading: boolean, isError: boolean} - Os dados do livro, ou `null` se o livro nao for encontrado.
 */
export function useLivro(id: string | null)
    : {
        data: Livro | undefined;
        isLoading: boolean;
        isError: boolean;
    } {
    //  assegura-se que o id nao seja nulo
    if (!id) {
        return {
            data: undefined,
            isLoading: false,
            isError: false,
        };
    }

    return useQuery<Livro>({
        queryKey: livrosKeys.detail(id),
        enabled: !!id,
        /**
         * Função que carrega um Livro da API.
         * Faz uma requisição GET para `/api/livros/${id}/` e retorna os dados do Livro encontrado.
         * @returns {Promise<Livro>} - Os dados do Livro encontrado.
         */
        queryFn: async () => {
            const res = await api.get(`/api/livros/${id}/`);
            return res.data;
        },
    });
}
```

## Modelagem dos Dados
Os dados definidos para o banco de dados e para o backend são refletidos em `types/`.

### `types/`

```bash
types/
├── Livro.ts
├── Associado.ts
├── Emprestimo.ts
├── Me.ts
└── index.ts
```

Note que `Me` é um tipo especial que representa os dados do usuário logado.
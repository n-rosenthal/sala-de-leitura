/**
 * `hooks/queryKeys/index.ts` — chaves do TanStack Query
 *
 * Fonte única de verdade para todas as query keys.
 * Usar sempre estas fábricas nos hooks — nunca strings literais.
 *
 * Convenção de estrutura por domínio:
 *
 *   domainKeys.all               → invalida TODO o domínio
 *   domainKeys.lists()           → invalida todas as listas
 *   domainKeys.list(params)      → lista com filtros específicos
 *   domainKeys.details()         → invalida todos os detalhes
 *   domainKeys.detail(id)        → detalhe de um registro
 *
 * @example
 * // Em um hook de domínio:
 * import { livrosKeys } from "@/hooks/queryKeys";
 *
 * useQuery({ queryKey: livrosKeys.list({ page: 1 }), ... })
 *
 * // Para invalidar toda a lista após uma mutation:
 * queryClient.invalidateQueries({ queryKey: livrosKeys.lists() })
 */

// Tipos
export interface LivrosParams {
    search?: string;
    page?: number;
    disponivel?: boolean;
}

export interface AssociadosParams {
    search?: string;
    page?: number;
}

export interface EmprestimosParams {
    page?: number;
    ativo?: boolean;
}

// Auth 
export const authKeys = {
    /** Dados do usuário autenticado (`/auth/me/`). */
    me: ["auth", "me"] as const,
} as const;

// Livros 
export const livrosKeys = {
    /** Raiz — invalida tudo relacionado a livros. */
    all: ["livros"] as const,

    /** Invalida todas as listas de livros. */
    lists: () => ["livros", "list"] as const,

    /** Lista com parâmetros de filtro/paginação específicos. */
    list: (params?: LivrosParams) => ["livros", "list", params ?? {}] as const,

    /** Invalida todos os detalhes de livros. */
    details: () => ["livros", "detail"] as const,

    /** Detalhe de um livro específico. */
    detail: (id: number) => ["livros", "detail", id] as const,
} as const;

// Associados
export const associadosKeys = {
    /** Raiz — invalida tudo relacionado a associados. */
    all: ["associados"] as const,

    /** Invalida todas as listas de associados. */
    lists: () => ["associados", "list"] as const,

    /** Lista com parâmetros de filtro/paginação específicos. */
    list: (params?: AssociadosParams) =>
        ["associados", "list", params ?? {}] as const,

    /** Invalida todos os detalhes de associados. */
    details: () => ["associados", "detail"] as const,

    /** Detalhe de um associado específico. */
    detail: (id: number) => ["associados", "detail", id] as const,

    /** Perfil do associado autenticado (`/associados/me/`). */
    me: () => ["associados", "me"] as const,
} as const;


// Empréstimos
export const emprestimosKeys = {
    /** Raiz — invalida tudo relacionado a empréstimos. */
    all: ["emprestimos"] as const,

    /** Invalida todas as listas de empréstimos. */
    lists: () => ["emprestimos", "list"] as const,

    /** Lista com parâmetros de filtro/paginação específicos. */
    list: (params?: EmprestimosParams) =>
        ["emprestimos", "list", params ?? {}] as const,

    /** Invalida todos os detalhes de empréstimos. */
    details: () => ["emprestimos", "detail"] as const,

    /** Detalhe de um empréstimo específico. */
    detail: (id: number) => ["emprestimos", "detail", id] as const,

    /** Empréstimos do associado autenticado (`/emprestimos/me/`). */
    me: () => ["emprestimos", "me"] as const,

    /** Empréstimos ativos no sistema (`/emprestimos/ativos/`). */
    ativos: () => ["emprestimos", "ativos"] as const,
} as const;
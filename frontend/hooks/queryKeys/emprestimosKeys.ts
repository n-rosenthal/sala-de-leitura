export const emprestimosKeys = {
    all: ["emprestimos"] as const,
    lists: () => ["emprestimos", "list"] as const,
    detail: (id: number) =>
        ["emprestimos", "detail", id] as const,
    me: () => ["emprestimos", "me"] as const,
    ativos: () => ["emprestimos", "ativos"] as const,
}
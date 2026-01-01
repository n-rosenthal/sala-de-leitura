export const livrosKeys = {
    all: ["livros"] as const,
    detail: (id: string) =>
        ["livros", "detail", id] as const,
}
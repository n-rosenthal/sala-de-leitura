export const associadosKeys = {
    all: ["associados"] as const,
    lists: () => ["associados", "list"] as const,
    list: (params?: unknown) =>
        ["associados", "list", params] as const,

    detail: (id: number) =>
        ["associados", "detail", id] as const,
}
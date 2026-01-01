import { usePaginated } from "@/hooks/core/usePaginated";

export function useAssociados(params = {}) {
    return usePaginated<any>("/api/associados/", params);
}

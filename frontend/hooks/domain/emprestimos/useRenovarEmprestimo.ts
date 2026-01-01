// hooks/domain/emprestimos/useRenovarEmprestimo.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { emprestimosKeys } from "@/hooks/queryKeys";

export function useRenovarEmprestimo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
        const res = await api.post(
            `/api/emprestimos/${id}/renovar/`
        );
        return res.data;
        },

        onSuccess: (_, id) => {
        queryClient.invalidateQueries({
            queryKey: emprestimosKeys.all,
        });

        queryClient.invalidateQueries({
            queryKey: emprestimosKeys.detail(id),
        });
        },
    });
}

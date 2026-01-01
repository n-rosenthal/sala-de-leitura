/**
 *  `frontend/hooks/domain/emprestimos/useDevolverEmprestimo.ts`, hook para devolver um empréstimo
 * 
 *  @see `backend/api/views/Emprestimo.py`
 */

//  react-query, chaves para consultas de empréstimos
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emprestimosKeys } from "@/hooks/queryKeys";

//  serviços da API
import api from "@/services/api";


/**
 * Hook para devolver um empréstimo.
 * 
 * @returns {Object} - Um objeto com as seguintes propriedades:
 *  mutationFn: Função que devolve um empréstimo.
 *  onSuccess: Função chamada quando a devolução do empréstimo é concluída com sucesso.
 */
export function useDevolverEmprestimo() {
    const queryClient = useQueryClient();

    return useMutation({
        /**
         * Função que devolve um empréstimo.
         * 
         * @param {number} emprestimoId - ID do empréstimo a ser devolvido.
         * @returns {Promise<any>} - Promessa com o resultado da devolução do empréstimo.
         */
        mutationFn: async (emprestimoId: number) => {
            const res = await api.post(
                `/api/emprestimos/${emprestimoId}/devolver/`
            );
            return res.data;
        },

        /**
         * Função chamada quando a devolução do empréstimo é concluída com sucesso.
         * Invalida as consultas para o detalhe do empréstimo, lista de empréstimos, lista de empréstimos ativos e lista de livros.
         * @param {_, emprestimoId} params - Parâmetros da devolução.
         */
        onSuccess: (_, emprestimoId) => {
            queryClient.invalidateQueries({
                queryKey: emprestimosKeys.detail(emprestimoId),
            });
            queryClient.invalidateQueries({
                queryKey: emprestimosKeys.all,
            });
            queryClient.invalidateQueries({
                queryKey: emprestimosKeys.ativos(),
            });
            queryClient.invalidateQueries({
                queryKey: emprestimosKeys.livros?.all,
            });
        },
    });
}

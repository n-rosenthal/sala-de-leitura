/**
 *  `frontend/hooks/domain/emprestimos/useCreateEmprestimo.ts`
 * 
 *  Hook para criar um empréstimo.
 * 
 *  @see `backend/api/views/Emprestimo.py`
 */

//  react-query, chaves para consultas de empréstimos
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emprestimosKeys } from "@/hooks/queryKeys";

//  serviços da API
import api from "@/services/api";

/**
 * Tipo payload para criação de um empréstimo
 */
type CreateEmprestimoPayload = {
    //  identificador alfanumérico único para livro
    livro: string;

    //  identificador numérico único para associado
    associado: number;
};

/**
 * Hook para criar um empréstimo.
 * 
 * @returns {{ mutationFn: (data: CreateEmprestimoPayload) => Promise<any>, onSuccess: () => void }}
 *  Um objeto com as seguintes propriedades:
 *  mutationFn: Função que cria um empréstimo.
 *  onSuccess: Função chamada quando a criação de um empréstimo é concluída com sucesso.
 */
export function useCreateEmprestimo() {
    const queryClient = useQueryClient();

    return useMutation({
        /**
         * Função que cria um empréstimo.
         * 
         * @param {CreateEmprestimoPayload} data - Dados para criação do empréstimo.
         * @returns {Promise<any>} - Promessa com o resultado da criação do empréstimo.
         */
        mutationFn: async (data: CreateEmprestimoPayload) => {
            const res = await api.post("/api/emprestimos/", data);
            return res.data;
        },

        /**
         * Função chamada quando a criação de um empréstimo é concluída com sucesso.
         * Invalida as consultas para a lista de empréstimos, lista de empréstimos ativos e lista de livros.
         */
        onSuccess: () => {
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
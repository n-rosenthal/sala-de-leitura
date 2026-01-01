/**
 * `frontend/hooks/domain/associados/useUpdateAssociado.ts`, hook de atualização de associado.
 */

//  react-query
import { useMutation, useQueryClient } from "@tanstack/react-query";

//  chaves de consulta
import { queryKeys } from "@/hooks/queryKeys";

//  serviços da API
import api from "@/services/api";

//  tipo `Associado`
import { Associado } from "@/types";

/**
 * Hook para atualizar um associado.
 *
 * Retorna um objeto com as seguintes propriedades:
 *  mutate: Função para atualizar um associado.
 *  mutateAsync: Função para atualizar um associado de forma assíncrona.
 *  isLoading: Booleano indicando se a atualização está em andamento.
 *  error: String com a mensagem de erro (se houver).
 *
 * @returns {Object} - Um objeto com as propriedades acima descritas.
 */
export function useUpdateAssociado() {
    //  react-query
    const queryClient = useQueryClient();

    //  atualiza um associado
    return useMutation({
        mutationFn: async ({ id, data }: {
        id: number;
        data: Partial<Associado>;
        }) => {
        await api.patch(`/api/associados/${id}/`, data);
        },

    /**
     * Função chamada quando a atualização de um associado é concluída com sucesso.
     * Invalida as consultas para o detalhe do associado e para a lista de associados.
     * @param {_, { id }: { data: Partial<Associado>; id: number } - Parâmetros da atualização.
     */
    onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({
            queryKey: ['associados', 'detail', id],
        });
        queryClient.invalidateQueries({
            queryKey: ['associados', 'lists'],
        });
    },
    });
}

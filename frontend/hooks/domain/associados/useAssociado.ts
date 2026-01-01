/**
 *  `frontend/hooks/domain/associados/useAssociado.ts`, hook de associado.
 * 
 *  Dado um `id: number`, carrega um `Associado` do banco de dados.
 */
//  serviço para API
import api from "@/services/api";

//  react-query
import { useQuery } from "@tanstack/react-query";

//  tipo `Associado`
import { Associado } from "@/types";

/**
 * Hook para carregar um Associado da API.
 * Recebe como parâmetro o `id` do Associado a ser carregado.
 * Retorna os dados do Associado, ou `null` se o Associado não for encontrado.
 * @param {number | null} id - O `id` do Associado a ser carregado.
 * @returns {Associado | null} - Os dados do Associado, ou `null` se o Associado não for encontrado.
 */
export function useAssociado(id: number | null) 
  : {
    data: Associado | undefined;
    isLoading: boolean;
    isError: boolean;
  } {
    return useQuery<Associado>({
      queryKey: ["associados", id],
      enabled: !!id,
    /**
     * Função que carrega um Associado da API.
     * Faz uma requisição GET para `/api/associados/${id}/` e retorna os dados do Associado encontrado.
     * @returns {Promise<Associado>} - Os dados do Associado encontrado.
     */
      queryFn: async () => {
        const res = await api.get(`/api/associados/${id}/`);
        return res.data;
      },
    });
};
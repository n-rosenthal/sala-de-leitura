/**
 *  `frontend/hooks/domain/emprestimos/useEmprestimosMe.ts`, hook de empréstimos do usuário logados
 * 
 * (meus empréstimos)
 */

//  react-query
import { useQuery } from "@tanstack/react-query";

//  serviços da API
import api from "@/services/api";

/**
 * Hook para carregar empréstimos do usuário logado (meus empréstimos).
 *
 * Retorna os dados dos empréstimos do usuário logado.
 *
 * @returns {Object} - Um objeto com as seguintes propriedades:
 *  data: Array de objetos `Emprestimo`.
 *  count: Número total de empréstimos.
 *  loading: Booleano indicando se a carga está em andamento.
 *  error: String com a mensagem de erro (se houver).
 */
export function useEmprestimosMe() {
    return useQuery({
        queryKey: ["emprestimos", "me"],
        /**
         * Função que carrega os dados dos empréstimos do usuário logado da API.
         * Retorna os dados dos empréstimos do usuário logado.
         * @returns {Emprestimo[]} - Os dados dos empréstimos do usuário logado.
         */
        queryFn: async () => {
        const res = await api.get("/api/emprestimos/me/");
        return res.data.results ?? res.data;
        },
    });
}
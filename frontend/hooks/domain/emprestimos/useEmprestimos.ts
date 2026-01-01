import { usePaginated } from "@/hooks/core/usePaginated";

/**
 * Hook para carregar empréstimos.
 *
 * Utiliza o hook `usePaginated` para carregar empréstimos.
 *
 * @param {Object} [params] Parâmetros para a consulta.
 * @returns {Object} Um objeto com as seguintes propriedades:
 *  data: Array de objetos `Emprestimo`.
 *  count: Número total de empréstimos.
 *  loading: Booleano indicando se a carga está em andamento.
 *  error: String com a mensagem de erro (se houver).
 */
export function useEmprestimos(params = {}) :
    { data: any[], count: number, loading: boolean, error: string | null } {
    return usePaginated<any>("/api/emprestimos/", params);
}
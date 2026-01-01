/**
 * `frontend/hooks/domain/livros/useLivros.ts`, hook para carregar livros.
 * 
 * Utiliza o hook `usePaginated` para carregar livros com paginação.
 * 
 */
//  Hook para respostas paginadas da API
import { usePaginated } from "@/hooks/core/usePaginated";

//  Tipo `Livro`
import { Livro } from "@/types";


/**
 * Hook para carregar livros.
 * 
 * Utiliza o hook `usePaginated` para carregar livros com paginação.
 * 
 * @param {Object} [params] - Parâmetros para a consulta.
 * @returns {Object} - Um objeto com as seguintes propriedades:
 *  data: Array de objetos `Livro`.
 *  count: Número total de livros.
 *  next: String com a URL para a próxima página.
 *  loading: Booleano indicando se a carga está em andamento.
 *  loadingMore: Booleano indicando se a carga de mais dados está em andamento.
 *  error: String com a mensagem de erro (se houver).
 *  loadMore: Função para carregar mais dados.
 */
export function useLivros(params = {})
    :
    {
        data: Livro[],
        count: number,
        next: string | null,
        loading: boolean,
        loadingMore: boolean,
        error: string | null,
        loadMore: () => Promise<void>
    } {
    return usePaginated<Livro>("/api/livros/", params);
}
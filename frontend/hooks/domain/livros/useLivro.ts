/**
 *  `frontend/hooks/domain/livros/useLivro.ts`, hook de livro.
 * 
 *  Dado um `id: number`, carrega um `Livro` do banco de dados.
 * 
 *  @ver `backend/api/views/Livro.py`
 * 
 *  Uso:
 * 
 * ```tsx
 * const { data, count, loading, error } = useLivro(id);
 * ```
 * 
 * @ver 'app/livros/[id]/page.tsx', página de detalhes de um livro
 */

//  react-query
import { useQuery } from "@tanstack/react-query";
import { livrosKeys } from "@/hooks/queryKeys";

//  serviços da API
import api from "@/services/api";

//  tipo `Livro`
import { Livro } from "@/types";

/**
 * Hook para carregaar um `Livro` da API.
 * 
 * Recebe como parâmetro o identificador alfanumérico único de um livro.
 * Retorna os dados do livro, ou `null` se o livro nao for encontrado.
 * 
 * @param {string | null} id - O identificador alfanumérico único de um livro.
 * @returns {data: Livro | undefined, isLoading: boolean, isError: boolean} - Os dados do livro, ou `null` se o livro nao for encontrado.
 */
export function useLivro(id: string | null)
    : {
        data: Livro | undefined;
        isLoading: boolean;
        isError: boolean;
    } {
    //  assegura-se que o id nao seja nulo
    if (!id) {
        return {
            data: undefined,
            isLoading: false,
            isError: false,
        };
    }

    return useQuery<Livro>({
        queryKey: livrosKeys.detail(id),
        enabled: !!id,
        /**
         * Função que carrega um Livro da API.
         * Faz uma requisição GET para `/api/livros/${id}/` e retorna os dados do Livro encontrado.
         * @returns {Promise<Livro>} - Os dados do Livro encontrado.
         */
        queryFn: async () => {
            const res = await api.get(`/api/livros/${id}/`);
            return res.data;
        },
    });
}
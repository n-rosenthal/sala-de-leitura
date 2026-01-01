/**
 * `frontend/hooks/core/usePaginated.ts`, hook para carregar dados com paginação.
 * 
 * Utiliza o hook `useQuery` para carregar dados com paginação.
 */

import { useEffect, useState } from "react";
import api from "@/services/api";

/**
 * Tipo genérico para resposta paginada de tipo T.
 * 
 * T sempre será algum de { `Associado`, `Emprestimo`, `Livro` }.
 */
type PaginatedResponse<T> = {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
};



/**
 * Hook para carregar dados com paginação.
 * 
 * @param {string} url - URL para a API que retorna dados com paginação.
 * @param {Record<string, any>} [params] - Parâmetros para a consulta.
 * @returns {Object} - Um objeto com as seguintes propriedades:
 *  data: Array de objetos `T`.
 *  count: Número total de elementos.
 *  next: String com a URL para a próxima página.
 *  loading: Booleano indicando se a carga está em andamento.
 *  loadingMore: Booleano indicando se a carga de mais dados está em andamento.
 *  error: String com a mensagem de erro (se houver).
 *  loadMore: Função para carregar mais dados.
 */
export function usePaginated<T>(
    url: string,
    params: Record<string, any> = {}
    ) {
        const [data, setData] = useState<T[]>([]);
        const [count, setCount] = useState(0);
        const [next, setNext] = useState<string | null>(null);
        const [loading, setLoading] = useState(true);
        const [loadingMore, setLoadingMore] = useState(false);
        const [error, setError] = useState<string | null>(null);

    /**
     * Carrega dados com paginação.
     * 
     * Se `initial` for verdadeiro, carrega os dados iniciais. Caso contrário, carrega mais dados.
     * 
     * @param {boolean} [initial=false] - Se verdadeiro, carrega os dados iniciais. Caso contrário, carrega mais dados.
     */
        async function load(initial = false) {
        try {
            initial ? setLoading(true) : setLoadingMore(true);
    
            const res = await api.get<PaginatedResponse<T>>(url, {
            params,
            });
    
            setData(initial ? res.data.results : prev => [...prev, ...res.data.results]);
            setCount(res.data.count);
            setNext(res.data.next);
        } catch {
            setError("Erro ao carregar dados");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
        }
    
    /**
     * Carrega mais dados.
     * 
     * Se `next` for nulo, não fazer nada. Caso contrário, carrega mais dados.
     * 
     * @returns {Promise<void>} - Uma promise que resolve quando a carga terminar.
     */
        async function loadMore() {
        if (!next) return;
    
        try {
            setLoadingMore(true);
            const res = await api.get<PaginatedResponse<T>>(next);
    
            setData(prev => [...prev, ...res.data.results]);
            setNext(res.data.next);
        } finally {
            setLoadingMore(false);
        }
        }
    
        useEffect(() => {
        load(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [url, ...Object.values(params)]);

        return {
        data,
        count,
        next,
        loading,
        loadingMore,
        error,
        loadMore,
        };
}
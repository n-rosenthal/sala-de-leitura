/**
 * `services/livros.ts` — serviço de livros
 *
 * Integração com os endpoints de livros do backend.
 */

import api from "./api";
import type { Livro } from "@/types";

// Tipos

export interface LivrosParams {
    search?: string;
    page?: number;
    page_size?: number;
    disponivel?: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// serviços para Livros

/**
 * Retorna a lista paginada de livros.
 *
 * @param params - Filtros e paginação opcionais.
 */
export async function getLivros(
    params?: LivrosParams
): Promise<PaginatedResponse<Livro>> {
    const { data } = await api.get<PaginatedResponse<Livro>>("/api/livros/", {
        params,
    });
    return data;
}

/**
 * Retorna apenas os livros disponíveis para empréstimo.
 */
export async function getLivrosDisponiveis(): Promise<Livro[]> {
    const { data } = await api.get<Livro[]>("/api/livros/disponiveis/");
    return data;
}

/**
 * Retorna um livro pelo seu ID.
 *
 * @param id - Identificador do livro.
 */
export async function getLivro(id: number): Promise<Livro> {
    const { data } = await api.get<Livro>(`/api/livros/${id}/`);
    return data;
}
/**
 *  `frontend/services/livros.ts`
 * 
 *  Serviços de integração com a API do backend para livros
 */

import  api from "./api";

/**
 * Retorna a lista de livros cadastrados no sistema.
 * 
 * @param {Object} [params] - Parâmetros para filtrar a lista de livros.
 * @returns {Promise<Response>} - Resposta da API com a lista de livros.
 */
export function getLivros(params?: any) {
    return api.get("/api/livros/", { params });
}

/**
 * Retorna uma lista de livros disponíveis para empréstimo.
 * 
 * @returns {Promise<Response>} - Resposta da API com a lista de livros disponíveis.
 */
export function getLivrosDisponiveis() {
    return api.get("/api/livros/disponiveis/");
}
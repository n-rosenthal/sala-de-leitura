/**
 * `services/server-api.ts` — cliente HTTP para Server Components
 *
 * \!!! EXCLUSIVO para Server Components e Route Handlers do Next.js.
 *      Em Client Components, usar `api.ts` (axios).
 *
 * Diferenças em relação ao `api.ts`:
 * - Usa `fetch` nativo (compatível com o runtime de servidor do Next.js)
 * - Não tem acesso ao `window` nem ao estado React
 * - Não possui interceptor de refresh — o token deve ser válido no momento da chamada
 * - `cache: "no-store"` por padrão para evitar dados obsoletos em SSR
 */

import "server-only";
import { logger } from "./logger";

// Config 

// Em Docker: "backend" resolve para o container Django internamente.
// Em produção: usa a URL pública via variável de ambiente.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://backend:8001";

// Tipos 
type ServerFetchOptions = Omit<RequestInit, "body"> & {
  /** Dados a serializar como JSON no corpo da requisição. */
  body?: unknown;
};

//  Helper interno 

/**
 * Realiza uma requisição HTTP para a API do servidor.
 * 
 * @template T - Tipo de dado a ser retornado pela requisição.
 * @param {string} url - URL relativa da requisição.
 * @param {ServerFetchOptions} [options] - Opções da requisição.
 * @returns {Promise<T>} - Uma promessa com o tipo de dado especificado.
 * 
 * Opções:
 * - `body`: Dados a serializar como JSON no corpo da requisição.
 * - `headers`: Cabeçalhos adicionais a serem incluídos na requisição.
 * 
 * Nota:
 * - O `credentials` é definido como `"include"` por padrão para enviar cookies em requisições HTTP.
 * - O `cache` é definido como `"no-store"` por padrão para evitar dados obsoletos em SSR.
 */
async function serverFetch<T>(
  url: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${url}`, {
    ...rest,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    logger.error(`Server API error`, { url, status: res.status });
    throw new Error(`Server API error: ${res.status} — ${url}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// Interface pública 

const serverApi = {
  /**
   * Realiza uma requisição HTTP GET para a API do servidor.
   * 
   * @template T - Tipo de dado a ser retornado pela requisição.
   * @param {string} url - URL relativa da requisição.
   * @param {ServerFetchOptions} [options] - Opções da requisição.
   * @returns {Promise<T>} - Uma promessa com o tipo de dado especificado.
   */
  get<T>(url: string, options?: ServerFetchOptions): Promise<T> {
    return serverFetch<T>(url, { ...options, method: "GET" });
  },

  /**
   * Realiza uma requisição HTTP POST para a API do servidor.
   * 
   * @template T - Tipo de dado a ser retornado pela requisição.
   * @param {string} url - URL relativa da requisição.
   * @param {unknown} [body] - Corpo da requisição em formato JSON.
   * @param {ServerFetchOptions} [options] - Opções da requisição.
   * @returns {Promise<T>} - Uma promessa com o tipo de dado especificado.
   */
  post<T>(url: string, body?: unknown, options?: ServerFetchOptions): Promise<T> {
    return serverFetch<T>(url, { ...options, method: "POST", body });
  },

  /**
   * Realiza uma requisição HTTP PATCH para a API do servidor.
   * 
   * @template T - Tipo de dado a ser retornado pela requisição.
   * @param {string} url - URL relativa da requisição.
   * @param {unknown} [body] - Corpo da requisição em formato JSON.
   * @param {ServerFetchOptions} [options] - Opções da requisição.
   * @returns {Promise<T>} - Uma promessa com o tipo de dado especificado.
   */
  patch<T>(url: string, body?: unknown, options?: ServerFetchOptions): Promise<T> {
    return serverFetch<T>(url, { ...options, method: "PATCH", body });
  },

  /**
   * Realiza uma requisição HTTP DELETE para a API do servidor.
   * 
   * @template T - Tipo de dado a ser retornado pela requisição.
   * @param {string} url - URL relativa da requisição.
   * @param {ServerFetchOptions} [options] - Opções da requisição.
   * @returns {Promise<T>} - Uma promessa com o tipo de dado especificado.
   */
  delete<T>(url: string, options?: ServerFetchOptions): Promise<T> {
    return serverFetch<T>(url, { ...options, method: "DELETE" });
  },
};

export default serverApi;
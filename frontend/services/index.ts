/**
 * `services/index.ts` — re-exportações centralizadas
 *
 * Ponto de entrada único para a camada de serviços.
 * Os hooks e componentes importam daqui, nunca diretamente dos arquivos.
 *
 * @example
 * import { getLivros, login, logger } from "@/services";
 */

// Cliente HTTP (Client Components)
export { default as api } from "./api";

// Cliente HTTP (Server Components)
export { default as serverApi } from "./server-api";

// Autenticação
export { login, logout, getMe, refreshToken } from "./auth";
export type { LoginCredentials, LoginResponse } from "./auth";

// Domínio da Aplicação
// Livros
export { getLivros, getLivrosDisponiveis, getLivro } from "./livros";
export type { LivrosParams, PaginatedResponse } from "./livros";

// Logger
export { logger } from "./logger";
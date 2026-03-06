/**
 * `services/api.ts` — cliente HTTP base (Client Components)
 *
 * - Baseado em axios com interceptor de refresh automático
 * - Fila de requisições paralelas durante o refresh
 * - Em caso de falha definitiva, emite "auth:logout" e redireciona
 */

import axios, { AxiosError, AxiosResponse } from "axios";
import { logger } from "./logger";

// instância do axios para uso em Client Components

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envia cookies HttpOnly automaticamente
  headers: { "Content-Type": "application/json" },
});

// refresh queue (fila de requisições paralelas durante o refresh)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Processa a fila de requisições paralelas durante o refresh.
 * - Caso um erro seja passado, rejeita todas as promessas da fila com o erro.
 * - Caso nenhum erro seja passado, resolve todas as promessas da fila com o valor true.
 * - Limpa a fila após processamento.
 */
function processQueue(error: unknown = null): void {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(true)));
  failedQueue = [];
}

// Interceptor de resposta

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest?._retry;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    const isOnLoginPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/login");

    if (is401 && !alreadyRetried && !isRefreshCall && !isOnLoginPage) {
      originalRequest._retry = true;

      // Se já há um refresh em curso, enfileira e aguarda
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;
      logger.debug("Token expirado — tentando refresh");

      try {
        await api.post("/api/auth/refresh/");
        logger.debug("Refresh bem-sucedido");
        processQueue();
        return api(originalRequest);
      } catch (refreshError) {
        logger.warn("Refresh falhou — encerrando sessão", refreshError);
        processQueue(refreshError);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Loga erros que não são 401 silenciosos
    if (error.response?.status !== 401) {
      logger.error(`API error ${error.response?.status}`, {
        url: originalRequest?.url,
        status: error.response?.status,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
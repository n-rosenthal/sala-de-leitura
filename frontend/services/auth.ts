/**
 * `services/auth.ts` — serviço de autenticação
 *
 * Funções concretas de autenticação: login, logout, refresh e sessão atual.
 * Todas as chamadas passam pelo cliente HTTP em `api.ts`, que gerencia
 * cookies e refresh automático de token.
 */

import api from "./api";
import type { Associado } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: Associado;
}

// ─── Funções ──────────────────────────────────────────────────────────────────

/**
 * Autentica o usuário com username e senha.
 * O backend define os cookies `access_token` e `refresh_token` na resposta.
 *
 * @returns O objeto do usuário autenticado.
 */
export async function login(credentials: LoginCredentials): Promise<Associado> {
    const { data } = await api.post<LoginResponse>("/api/auth/login/", credentials);
    return data.user;
}

/**
 * Encerra a sessão do usuário.
 * O backend invalida (blacklist) o refresh token e remove os cookies.
 */
export async function logout(): Promise<void> {
    await api.post("/api/auth/logout/");
}

/**
 * Retorna o usuário da sessão atual lendo o cookie de acesso.
 * Usado pelo AuthContext ao montar para restaurar a sessão após F5.
 *
 * @returns O usuário autenticado, ou lança erro 401 se não houver sessão.
 */
export async function getMe(): Promise<Associado> {
    const { data } = await api.get<Associado>("/api/auth/me/");
    return data;
}

/**
 * Solicita um novo par de tokens usando o `refresh_token` do cookie.
 * Normalmente chamado automaticamente pelo interceptor em `api.ts`;
 * exposto aqui para uso manual se necessário.
 */
export async function refreshToken(): Promise<void> {
    await api.post("/api/auth/refresh/");
}
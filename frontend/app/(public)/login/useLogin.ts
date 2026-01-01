"use client";

/**
 *  `frontend/app/(public)/login/useLogin.tsx`, hook para autenticação
 * 
 *  Hook para autenticação de usuários. Retorna o estado de autenticação, o estado de carregamento do usuário e as funções de login, logout e loginSuccess.
 */

//  hook para roteamento
import { useRouter } from "next/navigation";

//  hook para estado, react
import { useState } from "react";

/**
 * Hook para autenticação de usuários. Retorna o estado de autenticação, o estado de carregamento do usuário e as funções de login, logout e loginSuccess.
 * 
 * @returns {{ submit: (username: string, password: string) => Promise<void>, loading: boolean, error: string | null }}
 */
export function useLogin() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Função para realizar o login do usuário.
     * 
     * Realiza um POST para a rota `/api/auth/login/` com as credenciais do usuário.
     * Se o login for bem bem-sucedido, redireciona para a página inicial e recarrega a página.
     * Se o login falhar, seta o estado de erro com a mensagem de erro.
     * 
     * @param {string} username - Usuário do usuário.
     * @param {string} password - Senha do usuário.
     */
    async function submit(username: string, password: string) {
        setLoading(true);
        setError(null);

        try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
            {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
            }
        );

        if (!res.ok) {
            throw new Error("Usuário ou senha inválidos");
        }

        router.replace("/");
        router.refresh(); // MUITO IMPORTANTE
        } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
        } finally {
        setLoading(false);
        }
    }

    return { submit, loading, error };
}
/**
 * `frontend/hooks/auth/useAuth.tsx`, hook de autenticação
 * 
 * Hook para autenticação de usuários. Retorna o estado de autenticação, o estado de carregamento do usuário e as funções de login, logout e loginSuccess.
 */
"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";



export function useAuth() 
    : {
        user: any | null;
        roles: string[];
        permissions: string[];
        isAuthenticated: boolean;
        isStaff: boolean;
        isAdmin: boolean;
        logout: () => Promise<void>;
        loading: boolean;
    } {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth deve ser usado dentro de <AuthProvider />");
    }

    return {
        user: ctx.user,
        roles: ctx.user?.roles ?? [],
        permissions: ctx.user?.permissions ?? [],
        isAuthenticated: !!ctx.user,
        isStaff: ctx.user?.roles?.includes("staff") ?? false,
        isAdmin: ctx.user?.roles?.includes("admin") ?? false,
        logout: ctx.logout,
        loading: ctx.loading,
    };
}

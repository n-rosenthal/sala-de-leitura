/**
 * Contexto de autenticação (produção-ready)
 *
 * - Fonte da verdade: cookies HTTPOnly
 * - Tokens nunca são lidos no frontend
 * - Refresh é automático via interceptor do axios
 */

"use client";
import { useRouter } from "next/navigation";


import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

import api from "@/services/api";


/**
 * Tipos de usuários.
 */
export type User = {
    id: number;
    email: string;
    name: string;
    roles: string[];          // ["user", "staff", "admin"]
    is_staff: boolean;
    is_superuser: boolean;
    permissions: string[];    // ["livros:create", ...]
};

/**
 * Tipos do contexto de autenticação.
 */
type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

/**
 * Contexto de autenticação.
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider do contexto de autenticação.
 * 
 * Fornece o contexto de autenticação para os componentes filhos.
 * 
 * @param {ReactNode} children - Componentes filhos.
 * @returns {JSX.Element} - Elemento JSX com o contexto de autenticação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function loadUser() {
        try {
            const res = await api.get<User>("/api/auth/me/");
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        try {
            await api.post("/api/auth/logout/");
        } finally {
            window.dispatchEvent(new CustomEvent("auth:logout"));
            router.push("/login");
        }
    }

    async function refreshUser() {
        setLoading(true);
        await loadUser();
    }

    // 🔹 carrega usuário inicial
    useEffect(() => {
        loadUser();
    }, []);

    // 🔹 LISTENER GLOBAL DE LOGOUT (AQUI 👇)
    useEffect(() => {
        function handleLogout() {
            setUser(null);
            router.push("/login");
        }

        window.addEventListener("auth:logout", handleLogout);
        return () =>
            window.removeEventListener("auth:logout", handleLogout);
    }, [router]);

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


/**
 * Hook para acesso ao contexto de autenticação.
 * 
 * Retorna o objeto com informações do usuário autenticado, status de carregamento e função de logout.
 * 
 * Deve ser usado dentro de `<AuthProvider>`.
 * 
 * @returns {AuthContextType}
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error(
        "useAuth deve ser usado dentro de <AuthProvider>"
        );
    }
    return ctx;
};

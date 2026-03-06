"use client";

/**
 * `contexts/AuthContext.tsx` — contexto de autenticação
 *
 * Fonte da verdade: cookies HttpOnly gerenciados pelo backend.
 * O frontend nunca lê nem armazena tokens diretamente.
 *
 * Estrutura do usuário espelha o modelo Django:
 *   Associado (OneToOne → auth.User)
 *
 * Fluxo:
 *   mount → GET /auth/me/ → seta user
 *   login → POST /auth/login/ → seta user
 *   logout → POST /auth/logout/ → limpa user → redireciona
 *   interceptor 401 → tenta refresh → falha → emite "auth:logout"
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import type { Associado } from "@/types";

// Tipos
interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  user: Associado;
}

export interface AuthContextType {
  /** Associado autenticado. `null` se não houver sessão. */
  user: Associado | null;

  /** `true` enquanto verifica a sessão (ex: após F5 ou mount inicial). */
  loading: boolean;

  /** Autentica com username e senha. Atualiza `user` no estado. */
  login: (credentials: LoginCredentials) => Promise<void>;

  /** Encerra a sessão no backend e limpa o estado local. */
  logout: () => Promise<void>;

  /** Recarrega os dados do usuário a partir do backend. */
  refreshUser: () => Promise<void>;
}

// Contexto
export const AuthContext = createContext<AuthContextType | null>(null);

//  Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Associado | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega o associado autenticado a partir do cookie de acesso
  const loadUser = useCallback(async () => {
    try {
      const res = await api.get<Associado>("/api/auth/me/");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verifica sessão ao montar (restaura após F5)
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Escuta logout forçado pelo interceptor do axios (refresh falhou)
  useEffect(() => {
    function handleForceLogout() {
      setUser(null);
      router.push("/login");
    }

    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [router]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const res = await api.post<LoginResponse>("/api/auth/login/", credentials);
      setUser(res.data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout/");
    } finally {
      setUser(null);
      // O interceptor do axios escuta "auth:logout" — emitir aqui
      // garante que a fila de requisições pendentes também seja limpa.
      window.dispatchEvent(new CustomEvent("auth:logout"));
      router.push("/login");
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook interno (baixo nível) 
// Para uso público, prefira o `useAuth` de `hooks/auth/useAuth.ts`,
// que expõe uma interface mais rica (isStaff, isAdmin, roles, etc.).
export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext deve ser usado dentro de <AuthProvider />");
  }
  return ctx;
}

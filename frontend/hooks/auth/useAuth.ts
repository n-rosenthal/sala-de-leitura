"use client";

/**
 * `hooks/auth/useAuth.ts` — hook público de autenticação
 *
 * Interface estável para os componentes.
 * Nunca importar AuthContext diretamente nos componentes — sempre usar este hook.
 *
 * Derivações baseadas nos campos reais do modelo Django:
 *   isStaff  → user.user.is_staff      (acesso ao Django Admin)
 *   isAdmin  → user.user.is_superuser  (todas as permissões)
 *
 * @example
 * const { user, isAuthenticated, isAdmin, login, logout, loading } = useAuth();
 */

import { useAuthContext } from "@/contexts/AuthContext";
import type { Associado, DjangoUser } from "@/types";

// Tipo de retorno 
export interface UseAuthReturn {
  /** Associado autenticado. `null` se não houver sessão. */
  user: Associado | null;

  /** `true` enquanto verifica a sessão (ex: após F5). */
  loading: boolean;

  /** `true` se há um associado autenticado. */
  isAuthenticated: boolean;

  /**
   * `true` se `user.user.is_staff === true`.
   * Corresponde ao campo `is_staff` do Django auth.User.
   * Dá acesso ao Django Admin, mas não implica todas as permissões.
   */
  isStaff: boolean;

  /**
   * `true` se `user.user.is_superuser === true`.
   * Corresponde ao campo `is_superuser` do Django auth.User.
   * Implica todas as permissões do sistema.
   */
  isAdmin: boolean;

  /** Atalho para o DjangoUser aninhado. `null` se não autenticado. */
  djangoUser: DjangoUser | null;

  /** Autentica com username e senha. Atualiza o estado global. */
  login: (credentials: { username: string; password: string }) => Promise<void>;

  /** Encerra a sessão no backend e limpa o estado local. */
  logout: () => Promise<void>;

  /** Recarrega os dados do usuário a partir do backend. */
  refreshUser: () => Promise<void>;
}

// Hook 
export function useAuth(): UseAuthReturn {
  const { user, loading, login, logout, refreshUser } = useAuthContext();

  const djangoUser: DjangoUser | null = user?.user ?? null;

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    isStaff: djangoUser?.is_staff ?? false,
    isAdmin: djangoUser?.is_superuser ?? false,
    djangoUser,
    login,
    logout,
    refreshUser,
  };
}

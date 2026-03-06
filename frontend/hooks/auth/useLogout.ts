"use client";

/**
 * `hooks/auth/useLogout.ts` — hook de logout
 *
 * Centraliza todo o processo de encerramento de sessão:
 * 1. Chama o backend para invalidar o refresh token (blacklist)
 * 2. Limpa o cache do TanStack Query (evita dados de outro usuário vazarem)
 * 3. Redireciona para /login
 *
 * Usa `services/auth.ts` — nunca chama `fetch` diretamente.
 */

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout as logoutService } from "@/services";
import { logger } from "@/services";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout(): Promise<void> {
    try {
      await logoutService();
    } catch (error) {
      // Falha no backend não deve impedir o logout local
      logger.warn("Logout remoto falhou — limpando sessão local mesmo assim", error);
    } finally {
      // Limpa todo o cache para não vazar dados entre sessões
      queryClient.clear();

      router.replace("/login");
      router.refresh();
    }
  }

  return { logout };
}

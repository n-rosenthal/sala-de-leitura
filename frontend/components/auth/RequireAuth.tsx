// components/auth/RequireAuth.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * RequireAuth é um componente que verifica se o usuário está autenticado
 * e carregando. Se o usuário não estiver autenticado e não estiver
 * carregando, ele redireciona para /login. Se o usuário estiver
 * carregando ou não estiver autenticado, o componente retorna null.
 * 
 * loading é feito em `.../loading.tsx`
 */
export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    /**
     * Se não estiver carregando e não estiver autenticado, redireciona para /login
     */
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  /**
   * Se estiver carregando ou nao estiver autenticado, retorna null
   * 
   * loading é feito em `.../loading.tsx`
   */
  if (loading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Retorna empréstimos ativos (não devolvidos).
 * - Usuário comum: apenas os seus
 * - Staff/Admin: todos
 */
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Emprestimo } from "@/types";

export function useEmprestimosAtivos() {
  const query = useQuery<Emprestimo[]>({
    queryKey: ["emprestimos", "ativos"],
    queryFn: async () => {
      const res = await api.get("/api/emprestimos/ativos/");
      return res.data.results ?? res.data;
    },
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? "Erro ao carregar empréstimos"
      : null,
  };
}
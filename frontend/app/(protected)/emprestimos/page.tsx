"use client";

/**
 * Página /emprestimos
 * Exibe lista de empréstimos ativos
 * Permite renovar (apenas gerente)
 */

import { useEmprestimosAtivos } from "@/hooks/domain/emprestimos/useEmprestimosAtivos";
import { useRenovarEmprestimo } from "@/hooks/domain/emprestimos/useRenovarEmprestimo";
import { useAuth } from "@/contexts/AuthContext";

export default function EmprestimosPage() {
  const { user } = useAuth();

  const {
    data: emprestimos,
    loading,
    error,
  } = useEmprestimosAtivos();

  const renovarMutation = useRenovarEmprestimo();

  if (loading) return null;

  if (error) {
    return (
      <p className="p-4 text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">
        Empréstimos ativos
      </h1>

      {emprestimos && emprestimos.length === 0 ? (
        <p>Nenhum empréstimo ativo.</p>
      ) : (
        <div className="space-y-3">
          {emprestimos && emprestimos.map(e => (
            <div
              key={e.id}
              className="rounded-xl border p-4 space-y-2"
            >
              <div>
                <p className="font-medium">
                  {e.livro_titulo}
                </p>

                <p className="text-sm text-zinc-600">
                  Associado: {e.associado_nome}
                </p>

                <p className="text-sm text-zinc-600">
                  Emprestado em{" "}
                  {new Date(e.data_emprestimo).toLocaleDateString()}
                </p>

                {e.data_prevista_devolucao && (
                  <p className="text-sm text-zinc-600">
                    Devolver até{" "}
                    {new Date(
                      e.data_prevista_devolucao
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* AÇÕES */}
              {user?.is_gerente && (
                <button
                  onClick={() =>
                    renovarMutation.mutate(e.id)
                  }
                  disabled={renovarMutation.isPending}
                  className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                >
                  Renovar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




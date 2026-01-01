"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { Associado, Emprestimo } from "@/types";
import Link from "next/link";

export default function AssociadoDetalhePage() {
  const { id } = useParams<{ id: string }>();

  const [associado, setAssociado] =
    useState<Associado | null>(null);
  const [emprestimos, setEmprestimos] =
    useState<Emprestimo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/associados/${id}/`)
      .then(res => setAssociado(res.data))
      .catch(() =>
        setError("Erro ao carregar associado")
      );

    api.get(`/api/emprestimos/?associado=${id}`)
      .then(res =>
        setEmprestimos(res.data.results ?? res.data)
      );
  }, [id]);

  if (!associado) return null;

  const ativos = emprestimos.filter(
    e => e.data_devolucao === null
  );

  return (
    <div className="p-4 space-y-6">
      {/* Dados */}
      <div>
        <h1 className="text-2xl font-semibold">
          {associado.nome}
        </h1>

        <p className="text-sm">
          Status:{" "}
          {associado.esta_ativo ? "Ativo" : "Inativo"}
        </p>

        {associado.gerente && (
          <span className="inline-block rounded bg-purple-600 px-2 py-0.5 text-xs text-white">
            Gerente
          </span>
        )}
      </div>

      {/* Ações */}
      <Link
        href={`/associados/${id}/editar`}
        className="inline-block rounded bg-blue-600 px-3 py-1 text-white"
      >
        Editar
      </Link>

      {/* Empréstimos ativos */}
      <div>
        <h2 className="text-lg font-medium">
          Empréstimos ativos
        </h2>

        {ativos.length === 0 ? (
          <p>Nenhum empréstimo ativo.</p>
        ) : (
          <div className="space-y-2">
            {ativos.map(e => (
              <div
                key={e.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {e.livro_titulo}
                </p>
                <p className="text-sm text-zinc-600">
                  Desde{" "}
                  {new Date(
                    e.data_emprestimo
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico */}
      <div>
        <h2 className="text-lg font-medium">
          Histórico de empréstimos
        </h2>

        {emprestimos.length === 0 ? (
          <p>Nenhum empréstimo.</p>
        ) : (
          <div className="space-y-2">
            {emprestimos.map(e => (
              <div
                key={e.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {e.livro_titulo}
                </p>
                <p className="text-sm text-zinc-600">
                  {new Date(
                    e.data_emprestimo
                  ).toLocaleDateString()}
                  {" → "}
                  {e.data_devolucao
                    ? new Date(
                        e.data_devolucao
                      ).toLocaleDateString()
                    : "Ativo"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

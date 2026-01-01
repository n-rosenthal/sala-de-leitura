"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Associado } from "@/types";
import Link from "next/link";

export default function AssociadosPage() {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/associados/")
      .then(res => {
        setAssociados(res.data.results ?? res.data);
      })
      .catch(() => setError("Erro ao carregar associados"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Associados
        </h1>

        <Link
          href="/associados/novo"
          className="rounded bg-blue-600 px-3 py-1 text-white"
        >
          Novo associado
        </Link>
      </div>

      {associados.length === 0 ? (
        <p>Nenhum associado cadastrado.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {associados.map(a => (
            <div
              key={a.id}
              className="flex flex-col justify-between rounded-xl border p-4"
            >
              <div>
                <h3 className="font-medium">{a.nome}</h3>

                <p className="text-sm text-zinc-600">
                  Aniversário:{" "}
                  {new Date(a.aniversario).toLocaleDateString()}
                </p>

                <p className="text-sm">
                  Status:{" "}
                  {a.esta_ativo ? "Ativo" : "Inativo"}
                </p>

                {a.gerente && (
                  <span className="mt-1 inline-block rounded bg-purple-600 px-2 py-0.5 text-xs text-white">
                    Gerente
                  </span>
                )}
              </div>

              <Link
                href={`/associados/${a.id}/editar`}
                className="mt-3 inline-block rounded bg-zinc-800 px-3 py-1 text-center text-sm text-white hover:bg-zinc-700"
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

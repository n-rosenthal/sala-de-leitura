"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Livro, Emprestimo } from "@/types";
import Link from "next/link";

export default function LivroDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [livro, setLivro] = useState<Livro | null>(null);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/livros/${id}/`)
      .then(res => setLivro(res.data))
      .catch(() => setError("Erro ao carregar livro"));

    api.get(`/api/emprestimos/?livro=${id}`)
      .then(res =>
        setEmprestimos(res.data.results ?? res.data)
      );
  }, [id]);

  async function excluir() {
    const confirmar = confirm(
      "Tem certeza que deseja excluir este livro?\nEsta ação é irreversível."
    );
    if (!confirmar) return;

    try {
      await api.delete(`/api/livros/${id}/`);
      router.push("/livros");
    } catch {
      alert("Erro ao excluir livro");
    }
  }

  if (!livro) return null;

  return (
    <div className="p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {livro.titulo}
        </h1>
        <p className="text-zinc-600">
          {livro.autor} · {livro.ano}
        </p>

        <p className="text-sm">
          Status:{" "}
          <strong>{livro.status}</strong>
        </p>
      </div>

      {/* Ações */}
      <div className="flex gap-2 flex-wrap">
        {livro.pode_ser_emprestado && (
          <Link
            href={`/livros/${livro.id}/emprestar`}
            className="rounded bg-blue-600 px-3 py-1 text-white"
          >
            Emprestar
          </Link>
        )}

        <Link
          href={`/livros/${livro.id}/editar`}
          className="rounded bg-green-600 px-3 py-1 text-white"
        >
          Editar
        </Link>

        <button
          onClick={excluir}
          className="rounded bg-red-600 px-3 py-1 text-white"
        >
          Excluir
        </button>
      </div>

      {/* Histórico */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">
          Histórico de empréstimos
        </h2>

        {emprestimos.length === 0 ? (
          <p>Nenhum empréstimo registrado.</p>
        ) : (
          <div className="space-y-2">
            {emprestimos.map(e => (
              <div
                key={e.id}
                className="rounded border p-3"
              >
                <p className="font-medium">
                  {e.associado_nome}
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

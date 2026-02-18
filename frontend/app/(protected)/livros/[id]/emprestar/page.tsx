"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Livro, Associado } from "@/types";

export default function EmprestarLivroPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [livro, setLivro] = useState<Livro | null>(null);
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [associadoId, setAssociadoId] = useState<number | "">("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [dataMinima, setDataMinima] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Datas padrão */
  useEffect(() => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    setDataMinima(amanha.toISOString().split("T")[0]);

    const seteDias = new Date();
    seteDias.setDate(seteDias.getDate() + 7);
    setDataPrevista(seteDias.toISOString().split("T")[0]);
  }, []);

  /* Carregar livro + associados */
  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [livroRes, associadosRes] = await Promise.all([
          api.get(`/api/livros/${id}/`),
          api.get("/api/associados/"),
        ]);

        setLivro(livroRes.data);
        setAssociados(associadosRes.data.results ?? associadosRes.data);
      } catch (err: any) {
        console.error(err);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id]);

  async function emprestar() {
    if (!associadoId) {
      setError("Selecione um associado.");
      return;
    }

    if (!dataPrevista) {
      setError("Selecione a data prevista de devolução.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/emprestimos/", {
        livro: id,
        associado: associadoId,
        data_prevista: dataPrevista,
      });

      alert("✅ Empréstimo realizado com sucesso!");
      router.push("/emprestimos");
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erro ao criar empréstimo.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !livro) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!livro) {
    return (
      <div className="p-6">
        <p className="text-red-600">Livro não encontrado.</p>
        <button onClick={() => router.back()} className="mt-4 underline">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Emprestar Livro</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p className="font-medium">{livro.titulo}</p>
        <p className="text-sm text-gray-600">{livro.autor}</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Associado</label>
          <select
            value={associadoId}
            onChange={(e) => setAssociadoId(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          >
            <option value="">Selecione…</option>
            {associados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Data prevista de devolução
          </label>
          <input
            type="date"
            value={dataPrevista}
            min={dataMinima}
            onChange={(e) => setDataPrevista(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={emprestar}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processando…" : "Confirmar Empréstimo"}
          </button>

          <button
            onClick={() => router.back()}
            disabled={loading}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}


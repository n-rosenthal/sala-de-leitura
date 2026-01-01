/**
 *  `frontend/app/(protected)/emprestimos/[id]/devolver/page.tsx`, componente `/emprestimos/[id]/devolver`
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";

export default function DevolverPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(false);
  }, []);

  async function confirmarDevolucao() {
    try {
      await api.patch(`/api/emprestimos/${id}/`, {
        data_devolucao: new Date().toISOString().slice(0, 10),
      });

      router.push("/emprestimos");
    } catch {
      setError("Erro ao registrar devolução");
    }
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        Confirmar devolução
      </h1>

      <p>
        Tem certeza que deseja registrar a devolução
        deste livro?
      </p>

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={confirmarDevolucao}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Confirmar
        </button>

        <button
          onClick={() => router.back()}
          className="rounded border px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

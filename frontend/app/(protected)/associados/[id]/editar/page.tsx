"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Associado } from "@/types";

export default function EditarAssociadoPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();

  const [associado, setAssociado] = useState<Associado | null>(null);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [loadingVinculo, setLoadingVinculo] = useState(false);

  useEffect(() => {
    api
      .get(`/api/associados/${id}/`)
      .then(res => setAssociado(res.data))
      .catch(() => setError("Erro ao carregar associado"));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!associado) return;

    const { name, checked } = e.target;

    setAssociado({
      ...associado,
      [name]: checked,
    });
  }

  async function salvar() {
    if (!associado) return;

    try {
      await api.patch(`/api/associados/${id}/`, {
        esta_ativo: associado.esta_ativo,
        gerente: associado.gerente,
      });

      router.push("/associados");
    } catch {
      setError("Erro ao salvar alterações");
    }
  }

  async function vincular() {
    if (!userId) {
      setError("Informe o ID do usuário");
      return;
    }

    try {
      setLoadingVinculo(true);
      setError("");

      await api.post(
        `/api/associados/${id}/vincular-usuario/`,
        { user_id: Number(userId) }
      );

      alert("Usuário vinculado com sucesso");
      setUserId("");
    } catch {
      setError("Erro ao vincular usuário");
    } finally {
      setLoadingVinculo(false);
    }
  }

  if (!associado) {
    return (
      <div className="p-4 text-center text-zinc-500">
        Carregando associado…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-xl font-semibold">
        Editar associado
      </h1>

      <p className="font-medium">{associado.nome}</p>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="esta_ativo"
          checked={associado.esta_ativo}
          onChange={handleChange}
        />
        Ativo
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="gerente"
          checked={associado.gerente}
          onChange={handleChange}
        />
        Gerente
      </label>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={salvar}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white"
      >
        Salvar alterações
      </button>

      <hr />

      <h2 className="text-lg font-medium">
        Vincular usuário existente
      </h2>

      <input
        placeholder="ID do usuário"
        value={userId}
        onChange={e => setUserId(e.target.value)}
        className="w-full rounded border p-2"
      />

      <button
        onClick={vincular}
        disabled={loadingVinculo}
        className="w-full rounded bg-purple-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loadingVinculo ? "Vinculando..." : "Vincular usuário"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import api from "@/services/api";
import { Livro, LivroStatus } from "@/types";

type Props = {
  initialData?: Partial<Livro>;
  onSuccess?: () => void;
};

const statusOptions: LivroStatus[] = [
  "DISPONIVEL",
  "EMPRESTADO",
  "PARA_GUARDAR",
  "DOADO",
  "PERDIDO",
];

export function LivroForm({ initialData = {}, onSuccess }: Props) {
  const [form, setForm] = useState({
    id: initialData.id ?? "",
    titulo: initialData.titulo ?? "",
    autor: initialData.autor ?? "",
    ano: initialData.ano ?? new Date().getFullYear(),
    status: initialData.status ?? "DISPONIVEL",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData.id) {
        // edição
        await api.put(`/api/livros/${initialData.id}/`, form);
      } else {
        // criação
        await api.post("/api/livros/", form);
      }

      onSuccess?.();
    } catch {
      setError("Erro ao salvar livro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <p className="text-red-500">{error}</p>}

      <input
        name="id"
        placeholder="ID do livro"
        value={form.id}
        onChange={handleChange}
        required
        disabled={!!initialData.id}
        className="input"
      />

      <input
        name="titulo"
        placeholder="Título"
        value={form.titulo}
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="autor"
        placeholder="Autor"
        value={form.autor}
        onChange={handleChange}
        required
        className="input"
      />

      <input
        type="number"
        name="ano"
        placeholder="Ano"
        value={form.ano}
        onChange={handleChange}
        required
        className="input"
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="input"
      >
        {statusOptions.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}

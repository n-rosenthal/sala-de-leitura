"use client";

import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";

export default function NovoAssociadoPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    aniversario: "",
    esta_ativo: true,
    gerente: false,
    username: "",
    password: "",
    email: "",
  });

  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await api.post("/api/associados/", form);
      router.push("/associados");
    } catch {
      setError("Erro ao criar associado");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 p-4"
    >
      <h1 className="text-xl font-semibold">
        Novo associado
      </h1>

      <input
        name="nome"
        placeholder="Nome"
        onChange={handleChange}
        className="w-full border p-2"
        required
      />

      <input
        type="date"
        name="aniversario"
        onChange={handleChange}
        className="w-full border p-2"
        required
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="gerente"
          onChange={handleChange}
        />
        Gerente
      </label>

      <hr />

      <p className="text-sm text-zinc-600">
        Criar usuário para login (opcional)
      </p>

      <input
        name="username"
        placeholder="Usuário"
        onChange={handleChange}
        className="w-full border p-2"
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full border p-2"
      />

      <input
        type="password"
        name="password"
        placeholder="Senha"
        onChange={handleChange}
        className="w-full border p-2"
      />

      {error && <p className="text-red-600">{error}</p>}

      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Criar associado
      </button>
    </form>
  );
}

/**
 *  `frontend/app/(protected)/livros/novo/page.tsx`, componente `/livros/novo`
 * 
 *  Exibe um formulário para criar um novo `Livro`.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function NovoLivroPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        id: "",
        titulo: "",
        autor: "",
        ano: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("/api/livros/", {
                ...form,
                ano: Number(form.ano),
            });
            router.push("/livros");
            } catch (err: any) {
                console.error(err.response?.data);
                setError(
                    JSON.stringify(err.response?.data, null, 2)
                );
            } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-semibold">Novo Livro</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    name="id"
                    placeholder="Código do livro"
                    className="w-full rounded border p-2"
                    onChange={handleChange}
                />
                <input
                    name="titulo"
                    placeholder="Título"
                    className="w-full rounded border p-2"
                    onChange={handleChange}
                />
                <input
                    name="autor"
                    placeholder="Autor"
                    className="w-full rounded border p-2"
                    onChange={handleChange}
                />
                <input
                    name="ano"
                    placeholder="Ano"
                    type="number"
                    className="w-full rounded border p-2"
                    onChange={handleChange}
                />

                {error && <p className="text-red-500">{error}</p>}

                <button
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                    {loading ? "Salvando..." : "Salvar"}
                </button>
            </form>
        </div>
    );
}

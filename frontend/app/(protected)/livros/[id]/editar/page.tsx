"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";

/**
 * Página para edição de um livro.
 *
 * Carrega o livro com o ID fornecido e exibe um formulário para edição.
 * Envia uma requisição PUT para a API com os dados do livro quando o formulário for submetido.
 */
export default function EditarLivroPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [form, setForm] = useState({
        id: "",
        titulo: "",
        autor: "",
        ano: "",
        status: "DISPONIVEL",
    });

    // estados
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState("");
    const [deleting, setDeleting] = useState(false);

    /**
     * Carrega o livro com o ID fornecido.
     *
     * Envia uma requisição GET para a API com o ID do livro.
     * Se a requisição for bem-sucedida, atualiza o estado do formulário com os dados do livro.
     * Caso contrário, exibe uma mensagem de erro.
     * Finalmente, define o estado de loading como falso.
     */
    useEffect(() => {
        api.get(`/api/livros/${id}/`)
            .then(res => {
                const livro = res.data;
                setForm({
                    id: livro.id,
                    titulo: livro.titulo,
                    autor: livro.autor,
                    ano: String(livro.ano),
                    status: livro.status,
                });
            })
            .catch(() => setError("Erro ao carregar livro"))
            .finally(() => setLoading(false));
    }, [id]);

    /**
     *  Atualiza o estado do formulário com as alterações feitas pelo usuário.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - O evento de alteração do formulário.
     */
    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    /**
     * Salva as alterações do livro.
     *
     * Submete o formulário para salvamento.
     * Envia uma requisição PUT para a API com os dados do livro.
     * Se a requisição for bem-sucedida, redireciona para a página de lista de livros.
     * Caso contrário, exibe uma mensagem de erro.
     */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await api.put(`/api/livros/${id}/`, {
                ...form,
                ano: Number(form.ano),
            });
            router.push("/livros");
        } catch {
            setError("Erro ao salvar alterações");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
      const confirmed = window.confirm(
          "⚠️ Tem certeza que deseja excluir este livro?\n\nEsta ação não pode ser desfeita."
      );
  
      if (!confirmed) return;
  
      setDeleting(true);
      setError("");
  
      try {
          await api.delete(`/api/livros/${id}/`);
          router.push("/livros");
      } catch {
          setError("Erro ao excluir livro");
          setDeleting(false);
      }
    }

    if (loading) return <p>Carregando...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-semibold">Editar Livro</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    name="id"
                    disabled
                    className="w-full rounded border p-2 bg-zinc-100"
                    value={form.id}
                />

                <input
                    name="titulo"
                    placeholder="Título"
                    className="w-full rounded border p-2"
                    value={form.titulo}
                    onChange={handleChange}
                />

                <input
                    name="autor"
                    placeholder="Autor"
                    className="w-full rounded border p-2"
                    value={form.autor}
                    onChange={handleChange}
                />

                <input
                    name="ano"
                    type="number"
                    placeholder="Ano"
                    className="w-full rounded border p-2"
                    value={form.ano}
                    onChange={handleChange}
                />

                <select
                    name="status"
                    className="w-full rounded border p-2"
                    value={form.status}
                    onChange={handleChange}
                >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EMPRESTADO">Emprestado</option>
                    <option value="PARA_GUARDAR">Para guardar</option>
                    <option value="DOADO">Doado</option>
                    <option value="PERDIDO">Perdido</option>
                </select>

                {error && <p className="text-red-500">{error}</p>}

                
                <div className="flex justify-between pt-4">
                  <button
                      disabled={saving}
                      className="rounded bg-blue-600 px-4 py-2 text-white"
                  >
                      {saving ? "Salvando..." : "Salvar alterações"}
                  </button>

                  <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded bg-red-600 px-4 py-2 text-white"
                  >
                      {deleting ? "Excluindo..." : "Excluir livro"}
                  </button>
              </div>
            </form>
        </div>
    );
}

"use client";

/**
 *  `frontend/components/domain/livros/LivrosClient.tsx`, componente `/livros`
 * 
 *  Componente de exibição de livros
 */

import { LivroCard } from "@/components/domain/livros/card/LivroCard";
import { useLivros } from "@/hooks/domain/livros/useLivros";

type Props = {
    search?: string;
};

/**
 * Componente de exibição de livros.
 * 
 * Recebe um parâmetro `search` opcional para filtrar livros por título ou autor.
 * 
 * Retorna um elemento JSX com uma lista de livros, mostrando a quantidade de livros encontrados e
 * permitindo carregar mais dados com o botão "Carregar mais".
 */
export function LivrosClient({ search = "" }: Props) {
    const {
        data: livros,
        count,
        next,
        loading,
        loadingMore,
        loadMore,
    } = useLivros({ search });

    if (loading) return null;

    return (
        <div className="space-y-6">
        <p className="text-gray-600">
            {count} livros encontrados
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {livros.map(livro => (
            <LivroCard key={livro.id} livro={livro} />
            ))}
        </div>

        {next && (
            <div className="text-center">
            <button
                onClick={loadMore}
                disabled={loadingMore}
                className="border px-6 py-3 rounded-lg"
            >
                {loadingMore ? "Carregando..." : "Carregar mais"}
            </button>
            </div>
        )}
        </div>
    );
}

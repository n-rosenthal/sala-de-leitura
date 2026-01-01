"use client";

import { useEffect } from "react";

/**
 * Componente de fallback quando erros de execução/runtime ocorrerem na página '/livros'
 *
 * @param {Error & { digest?: string }} error - O objeto de erro com opcionalmente uma propriedade 'digest'
 * @param {() => void} reset - Função para tentar re-renderizar o segmento novamente
 *
 * @returns JSX.Element - Elemento JSX do componente
 */
export default function Error({
        error,
        reset,
    }: {
        error: Error & { digest?: string };
        reset: () => void;
    }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-red-500">
                Erro ao carregar os livros.
            </p>

            <button
                onClick={() => reset()}
                className="w-fit rounded bg-blue-600 px-3 py-1 text-white"
            >
                Tentar novamente
            </button>
        </div>
    );
}

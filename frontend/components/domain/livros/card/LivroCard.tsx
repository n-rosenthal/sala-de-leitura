/**
 * `frontend/componentes/domain/livros/card/LivroCard.tsx`, componente cartão para `Livro`
 * 
 * Exibe as informações principais de um `Livro` e ações disponíveis (emprestar e editar).
 */

//  Link para roteamento
import Link from "next/link";

//  Hook `useState`
import { useState } from "react";

//  Tipo `Livro`
import { Livro } from "@/types";

//  Componente status para `Livro`
import { LivroStatus } from "../LivroStatus";

/**
 * Interface de props para `LivroCard`
 */
type Props = {
    livro: Livro;
};


/**
 * Componente cartão para `Livro`.
 *
 * Mostra as informações principais de um `Livro` e ações disponíveis
 * (emprestar e editar).
 */
export function LivroCard({ livro }: Props) {
    return (
        <div id="livro-card" className="rounded-xl border p-4 shadow-sm">
            <div id="livro-card-info" className="mt-4">
                <div className="rounded-xl border p-4 shadow-sm">
                    <h3 className="text-lg font-semibold">[{livro.id}] {livro.titulo} ({livro.ano})</h3>
                </div>
            </div>

            {/* secção autor */}
            <div id="livro-card-autor" className="mt-2 flex items-center gap-2">
                <p className="text-sm font-semibold">Autor:</p>
                <p className="text-sm text-zinc-600">{livro.autor}</p>
                <Link
                    href={`/livros/?autor=${livro.autor}`}
                    className="text-sm text-zinc-600 hover:text-zinc-800"
                >
                    (ver outros livros deste autor)
                </Link>
            </div>

            {/* secção status */}
            <div id="livro-card-status" className="mt-2">
                <LivroStatus status={livro.status} />
            </div>

            {/* secção ações sobre livro */}
            <div id="livro-card-actions" className="mt-2">

                <div className="mt-3 flex gap-4">
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
                </div>
            </div>
        </div>
    );
};
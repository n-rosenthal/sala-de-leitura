/**
 *  `frontend/app/livros/loading.tsx`, loading para `/livros/[id]/emprestar`
 * 
 *  Componente de loading para `/livros/[id]/emprestar`
 */

/**
 * Componente de loading para `/livros/[id]/emprestar`.
 * 
 * Mostra uma mensagem de "carregando livro…" durante o carregamento da página.
 */
export default function Loading() {
    return (
        <div className="flex h-40 items-center justify-center">
            <p className="animate-pulse text-zinc-500">
                Carregando livro…
            </p>
        </div>
    );
}

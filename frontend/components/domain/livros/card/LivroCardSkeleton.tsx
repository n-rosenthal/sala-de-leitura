/**
 *  `frontend/components/domain/livros/card/LivroCardSkeleton.tsx`, componente de esqueleto para `LivroCard`
 */

/**
 * Exibe um esqueleto de um cart o de livro (LivroCard).
 * 
 * Utiliza o estilo `animate-pulse` para criar um efeito de pulsação no esqueleto,
 *  simulando o carregamento do componente.
 */
export function LivroCardSkeleton() {
    return (
        <div id="livro-card" className="h-40 rounded bg-zinc-200 animate-pulse" />
    );
}
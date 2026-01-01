/**
 *  `frontend/components/ui/PageSkeleton.tsx`
 * 
 * Exibe um esqueleto de uma página de carregamento. 
 */


/**
 * Renderiza um esqueleto de uma página de carregamento.
 * @returns {JSX.Element} - Elemento JSX que representa o esqueleto de uma página de carregamento.
 */
export function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
    
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                key={i}
                className="h-40 rounded bg-zinc-200 dark:bg-zinc-800"
                />
            ))}
            </div>
        </div>
    );
}

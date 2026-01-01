/**
 * `LivroStatus.tsx`
 * 
 * Componente status para `Livro`
 */

/**
 * Interface `MapType`
 * 
 * Mapeamento de strings (status de um `Livro`) para strings (classes CSS)
 */
interface MapType {
    [key: string]: string;
}

/**
 * Componente status para `Livro`
 * 
 * Exibe um texto com o status do `Livro`, formatado com uma classe CSS que muda a cor do texto
 * 
 * @param {{ status: string }} props - parâmetros do componente
 * @param {string} props.status - status do `Livro`
 * @returns {JSX.Element} - elemento JSX do componente
 */
export function LivroStatus({ status }: { status: string }) {
    const map : MapType = {
        DISPONIVEL: "text-green-600",
        EMPRESTADO: "text-red-600",
        PARA_GUARDAR: "text-yellow-600",
        DOADO: "text-zinc-400",
        PERDIDO: "text-black",
    };

    return (
        <div className="flex items-center gap-2">
            <p className={`mt-2 text-sm font-medium ${map[status]}`}>
                {status.replace("_", " ")}
            </p>
        </div>
    );
}
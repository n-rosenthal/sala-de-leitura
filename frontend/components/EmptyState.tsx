/**
 * `frontend/components/EmptyState.tsx`, componente de estado vazio
 * 
 * Lista vazia para ser exibida na ausência de dados.
 */

/**
 * Componente de estado vazio
 * 
 * Exibe uma mensagem de estado vazio com um título e uma ação opcional.
 * 
 * @param {{ title: string, action?: React.ReactNode }} props - parâmetros do componente
 * @param {string} props.title - título da mensagem de estado vazio
 * @param {React.ReactNode} [props.action] - ação opcional para ser exibida
 * @returns {JSX.Element} - elemento JSX do componente
 */
export function EmptyState({
    title,
    action,
    }: {
        title: string;
        action?: React.ReactNode;
    }) {
        return (
            <div className="py-12 text-center text-zinc-500">
                <p>{title}</p>
                {action && <div className="mt-4">{action}</div>}
            </div>
        );
    }
/**
 * `frontend/app/(protected)/not-found.tsx`, componente de erro 404 para rotas protegidas
 * 
 * Componente customizado para erro 404 (página não encontrada) quando a rota protegida não for encontrada
 */

/**
 * 
 */
export default function NotFound() {
    return (
        <div className="mx-auto max-w-sm py-20">
            <h1 className="text-2xl font-semibold">404: Página nao encontrada</h1>
        </div>
    );
}
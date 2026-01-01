    /**
 * `frontend/app/(protected)/livros/page.tsx`, componente `/livros`
 * 
 * Página para a rota '/livros'
 */

//  Componente cliente para exibir livros
import { LivrosClient } from "@/components/domain/livros/LivrosClient";

/**
 *  Tipo interface para parâmetros da rota `/livros`
 */
type PageProps = {
    searchParams?: Promise<{
        search?: string;
    }>;
};

/**
 * Página de exibição de livros.
 * 
 * Utiliza o hook `useLivros` para carregar livros com paginação.
 * 
 * @returns {JSX.Element} - Elemento JSX com a lista de livros.
 */
export default async function LivrosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const search = params?.search ?? "";

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Livros</h1>
            <LivrosClient search={search} />
        </div>
    );
}
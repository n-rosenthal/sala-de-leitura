/**
 *  `frontend/app/(protected)/me/page.tsx`, componente `/me`
 * 
 *  Exibe os dados do usuário logado e do associado dele.
 */

"use client";

//  hooks, react
import { useEffect, useState } from "react";

//  serviços da API para associados, empréstimos e usuário atual
import api from "@/services/api";

//  tipos `Associado`, `Emprestimo`, `Livro` e `Me`, usuário atual
import { Associado, Emprestimo, Livro, Me } from "@/types";

//  Componente lista vazia
import { EmptyState } from "@/components/EmptyState";

/**
 * Componente de exibição de dados da conta do usuário ativo atualmente.
 * 
 * @returns {React.ReactElement} - Elemento JSX do componente.
 */
export default function MinhaContaPage() {
    //  estados
    const [me, setMe]                   = useState<Me | null>(null);
    const [associado, setAssociado]     = useState<Associado | null>(null);
    const [emprestimos, setEmprestimos] = useState<Emprestimo<Associado, Livro>[]>([]);
    const [error, setError]             = useState("");


    useEffect(() => {
    /**
     * Carrega os dados da página. Tenta carregar os dados do
     * usuário logado, do associado do usuário e das empréstimos
     * do associado.
     */
        async function load() {
            try {
                //  tenta buscar na API os dados para '/me'
                const meRes = await api.get("api/auth/me/");
                setMe(meRes.data);

                //  tenta buscar na API os dados para '/api/associados/'
                // isto é, busca todos os associados do sistema
                const associadosRes =
                await api.get("/api/associados/");

                //  decide onde está o resultado da solicitação
                const lista =
                associadosRes.data.results ??
                associadosRes.data;

                // [debug], imprime os resultados em tela
                console.log(lista);
                console.log(meRes.data.id);

                //  identifica, dentre todos os associados, o associado == usuário atual
                const assoc = lista.find(
                    (a: any) => a.user_id === meRes.data.id
                );

                //  caso o associado não seja encontrado, exibe um erro
                if (!assoc) {
                    setError("Associado não encontrado");
                    return;
                }

                //  se o associado foi encontrado, atualiza o estado
                setAssociado(assoc);

                //  tenta buscar na API todos os empréstimos do associado
                const empRes = await api.get(
                `/api/emprestimos/?associado=${assoc.id}`
                );

                //  atualiza o estado com os empréstimos
                setEmprestimos(
                empRes.data.results ?? empRes.data
                );
            } catch {
                setError("Erro ao carregar dados");
            }
    }

    //  carrega os dados ao montar o componente
        load();
    }, []);

    if (error) {
        return (
        <p className="p-4 text-red-600">{error}</p>
        );
    }

    //  se nenhuma informação foi carregada, retorna null
    if (!me || !associado) return null;

    //  filtra os empréstimos ativos
    const ativos = emprestimos.filter(
        e => e.data_devolucao === null
    );

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">
            Minha conta
        </h1>

        {/* Dados pessoais */}
        <div className="rounded-xl border p-4 space-y-1">
            <p>
            <strong>Nome:</strong> {associado.nome}
            </p>
            <p>
            <strong>Usuário:</strong> {me.username}
            </p>
            <p>
            <strong>Email:</strong> {me.email}
            </p>
            <p>
            <strong>Status:</strong>{" "}
            {associado.esta_ativo
                ? "Ativo"
                : "Inativo"}
            </p>
        </div>

        {/* Empréstimos ativos */}
        <div>
            <h2 className="text-lg font-medium">
            Empréstimos ativos
            </h2>

            {ativos.length === 0 ? (
            <p>Nenhum empréstimo ativo.</p>
            ) : (
            <div className="space-y-2">
                {ativos.map(e => (
                <div
                    key={e.id}
                    className="rounded border p-3"
                >
                    <p className="font-medium">
                    {e.livro_titulo}
                    </p>
                    <p className="text-sm text-zinc-600">
                    Desde{" "}
                    {new Date(
                        e.data_emprestimo
                    ).toLocaleDateString()}
                    </p>
                </div>
                ))}
            </div>
            )}
        </div>

        {/* Histórico */}
        <div>
            <h2 className="text-lg font-medium">
            Histórico de empréstimos
            </h2>

            {emprestimos.length === 0 ? (
            <p>Nenhum empréstimo registrado.</p>
            ) : (
            <div className="space-y-2">
                {emprestimos.map(e => (
                <div
                    key={e.id}
                    className="rounded border p-3"
                >
                    <p className="font-medium">
                    {e.livro_titulo}
                    </p>
                    <p className="text-sm text-zinc-600">
                    {new Date(
                        e.data_emprestimo
                    ).toLocaleDateString()}
                    {" → "}
                    {e.data_devolucao
                        ? new Date(
                            e.data_devolucao
                        ).toLocaleDateString()
                        : "Ativo"}
                    </p>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
    }

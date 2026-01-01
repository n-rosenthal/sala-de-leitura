/**
 *  `frontend/app/(protected)/livros/[id]/emprestar/page.tsx`, componente `/livros/[id]/emprestar`
 * 
 *  Exibe um formulário para emprestar um `Livro`.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Livro, Associado } from "@/types";

interface VerificacaoLivro {
    pode_ser_emprestado: boolean;
    status: string;
    status_display: string;
    emprestimo_ativo: number | null;
    consistencia: {
        livro_id: string;
        status_atual: string;
        emprestimos_ativos: number;
        pode_ser_emprestado: boolean;
        inconsistencias: string[];
        consistente: boolean;
    };
}

export default function EmprestarLivroPage() {
    //  identificador único do livro
    const { id } = useParams<{ id: string }>();

    //  hook para navegação
    const router = useRouter();

    //  estados
    const [livro, setLivro] = useState<Livro | null>(null);
    const [associados, setAssociados] = useState<Associado[]>([]);
    const [associadoId, setAssociadoId] = useState<number | "">("");
    const [dataPrevista, setDataPrevista] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [verificacao, setVerificacao] = useState<VerificacaoLivro | null>(null);
    const [dataMinima, setDataMinima] = useState<string>("");

    useEffect(() => {
        /**
         * Define as datas iniciais do formulário de empréstimo.
         * A data mínima para devolução é amanhã e a data prevista para devolução é 7 dias a partir de amanhã.
         */
        // Define a data mínima como amanhã
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        setDataMinima(amanha.toISOString().split("T")[0]);
    
        // Define a data prevista padrão como 7 dias a partir de amanhã
        const seteDias = new Date();
        seteDias.setDate(seteDias.getDate() + 7);
        setDataPrevista(seteDias.toISOString().split("T")[0]);
    }, []);

    
    useEffect(() => {
        /** Se `id` existir, então
         *      verifique se o livro pode ser emprestado (e, se puder, então)
         *      carregue os dados do livro e dos associados envolvidos no empréstimo
         */
        if (id) {
            verificarLivro();
            carregarDados();
        }
    }, [id]);

    /**
     * Verifica se o livro pode ser emprestado (e, se pode, então)
     *      carregue os dados do livro e dos associados envolvidos no empréstimo
     * @returns {Promise<void>}
     */
    async function verificarLivro() {
        setLoading(true);
        try {
            //  Endpoint para verificação de um livro
            const response = await api.get(`/api/livros/${id}/verificar/`);
            setVerificacao(response.data);
            
            //  Se o livro não pode ser emprestado, então exiba uma mensagem de erro
            if (!response.data.pode_ser_emprestado) {
                let mensagemErro = "Este livro não pode ser emprestado. ";
                
                if (response.data.emprestimo_ativo) {
                mensagemErro += `Já está emprestado (ID do empréstimo: ${response.data.emprestimo_ativo}).`;
                } else {
                mensagemErro += `Status atual: ${response.data.status_display}`;
                }
                
                setError(mensagemErro);
            }

        } catch (error) {
            //  Se ocorrer um erro ao verificar o livro, exiba uma mensagem de erro
            console.error("Erro ao verificar livro:", error);
            setError("Erro ao verificar disponibilidade do livro.");
        } finally {
            setLoading(false);
        }
    }
    
    /**
     * Carrega os dados do livro e dos associados envolvidos no empréstimo.
     * 
     * @throws {Error} Se ocorrer um erro ao carregar os dados.
     */
    async function carregarDados() {
        //  Endpoint para carregar os dados do livro e dos associados
        try {
            const [livroRes, associadosRes] = await Promise.all([
                api.get(`/api/livros/${id}/`),
                api.get("/api/associados/"),
            ]);        
            setLivro(livroRes.data);
            
            const associadosAtivos = associadosRes.data.results || associadosRes.data;            
            setAssociados(associadosAtivos);
        } catch (err: any) {
            console.error("Erro ao carregar dados:", err);
            setError(
                err?.response?.data?.message || 
                "Erro ao carregar dados. Verifique sua conexão."
            );
        }
    }

    /**
     * Cria um empréstimo de um livro para um associado.
     * 
     * Valida se o associado e a data prevista de devolução foram selecionados.
     * Valida se o livro está disponível para empréstimo.
     * 
     * Se o empréstimo for criado com sucesso, redireciona o usuário para a página de empréstimos.
     * Se ocorrer um erro, exibe uma mensagem de erro específica.
     * 
     * @throws {Error} Se ocorrer um erro ao criar o empréstimo.
     */
    async function emprestar() {        
        // Validações
        if (!associadoId) {
            setError("Selecione um associado.");
            return;
        }
    
        if (!dataPrevista) {
            setError("Selecione uma data prevista de devolução.");
            return;
        }
    
        if (verificacao && !verificacao.pode_ser_emprestado) {
            setError("Este livro não está disponível para empréstimo.");
            return;
        }
    
        // Limpa mensagens de erro e inicia o loading
        setLoading(true);
        setError("");
    
        try {
            // CORREÇÃO: Criar novo empréstimo (não devolver)
            await api.post("/api/emprestimos/", {
                livro: id,          // ID do livro (string)
                associado: associadoId, // ID do associado (número)
                data_prevista: dataPrevista, // Data no formato YYYY-MM-DD
            });
            
            // Feedback de sucesso
            alert("✅ Empréstimo realizado com sucesso!");
            
            console.log(`Novo empréstimo: Livro ${id} para associado ${associadoId}`);
            
            // Redireciona após 1 segundo para dar tempo de ver o alerta
            setTimeout(() => {
                router.push("/emprestimos");
                router.refresh();
            }, 1000);
            
        } catch (err: any) {
            console.error("Erro ao criar empréstimo:", err);
            
            let errorMessage = "Erro ao processar empréstimo.";
            
            if (err.response?.status === 400) {
                errorMessage = "Dados inválidos para empréstimo.";
            } else if (err.response?.status === 403) {
                errorMessage = "Você não tem permissão para realizar empréstimos.";
            } else if (err.response?.status === 404) {
                errorMessage = "Livro ou associado não encontrado.";
            }
            
            // Sobrescreve com mensagem específica da API, se disponível
            if (err.response?.data) {
                const data = err.response.data;
                
                if (data.error) errorMessage = data.error;
                else if (data.detail) errorMessage = data.detail;
                else if (data.non_field_errors) errorMessage = data.non_field_errors.join(", ");
                else if (data.livro) errorMessage = `Livro: ${data.livro}`;
                else if (data.associado) errorMessage = `Associado: ${data.associado}`;
                else if (data.data_prevista) errorMessage = `Data prevista: ${data.data_prevista}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    // Se está carregando e ainda não tem livro, mostrar um spinner
    if (loading && !livro) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Se não encontrou o livro, mostrar mensagem
    if (!livro) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Livro não encontrado ou não disponível.
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Emprestar Livro
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Preencha os dados abaixo para realizar o empréstimo
                    </p>
                </div>

                {/* Informações do Livro */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">
                        Informações do Livro
                    </h2>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-lg">{livro.titulo}</h3>
                                <p className="text-gray-600">
                                    <span className="font-medium">Autor:</span> {livro.autor}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Ano:</span> {livro.ano}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Código:</span> {livro.id}
                                </p>
                            </div>
                            
                            {verificacao && (
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    verificacao.pode_ser_emprestado 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"
                                }`}>
                                    {verificacao.pode_ser_emprestado ? "✅ Disponível" : "❌ Indisponível"}
                                </div>
                            )}
                        </div>
                        
                        {verificacao && !verificacao.pode_ser_emprestado && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-800 text-sm">
                                    <span className="font-medium">Motivo:</span> {verificacao.status_display}
                                    {verificacao.emprestimo_ativo && (
                                        <> (Empréstimo ativo: #{verificacao.emprestimo_ativo})</>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulário de Empréstimo */}
                <div className="space-y-6">
                    {/* Seleção do Associado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Associado <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={associadoId}
                            onChange={(e) => setAssociadoId(Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!verificacao?.pode_ser_emprestado || loading}
                        >
                            <option value="">Selecione um associado...</option>
                            {associados.map((associado) => (
                                <option key={associado.id} value={associado.id}>
                                    {associado.nome}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Selecione o associado que receberá o livro
                        </p>
                    </div>

                    {/* Data de Devolução Prevista */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Prevista de Devolução <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={dataPrevista}
                            min={dataMinima}
                            onChange={(e) => setDataPrevista(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!verificacao?.pode_ser_emprestado || loading}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Data máxima para devolução do livro
                        </p>
                    </div>

                    {/* Mensagens de Erro */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={emprestar}
                            disabled={!verificacao?.pode_ser_emprestado || loading || !associadoId || !dataPrevista}
                            className={`
                                flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                                ${!verificacao?.pode_ser_emprestado || loading || !associadoId || !dataPrevista
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Processando...
                                </span>
                            ) : (
                                "Confirmar Empréstimo"
                            )}
                        </button>

                        <button
                            onClick={() => router.back()}
                            disabled={loading}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* Avisos Importantes */}
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">⚠️ Atenção</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Verifique se o associado está regular com suas pendências</li>
                        <li>• O associado é responsável pela devolução no prazo</li>
                        <li>• Multas podem ser aplicadas em caso de atraso</li>
                        <li>• Esta ação será registrada no sistema de logs</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
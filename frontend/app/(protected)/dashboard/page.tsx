"use client";
/**
 * Página dashboard da sala de leitura.
 * 
 * São exibidos uma série de componentes funcionais relativos ao estado atual da sala de leitura.
 * São os componentes:
 *  -   `ManagerGreetingCard`, cartão de boas-vindas ao gerente;
 *      -   nome, username, última vez online do gerente.
 *  -   `SalaDeLeituraCard`, cartão da sala de leitura;
 *      -   `CurrentStatus`, status atual da sala de leitura;
 *          -   livros disponíveis, empréstimos ativos, quantidade de associados e empréstimos atrasados
 *      -   `UltimosEmprestimos`, listagem dos 5 empréstimos mais recentes.
 * 
 * 
 *  [futuramente:: sistema para guardar livros; ... ]
 */

//  estados, react
import { useEffect, useState } from "react";

//  Tipos
import { Associado, 
        Livro, 
        Emprestimo } from "@/types";

//  Serviço de API 
import api from "@/services/api";

//  Contexto de autenticação
import { useAuth } from "@/contexts/AuthContext";

//  Componentes do dashboard
import { ManagerGreetingCard }      from "@/components/domain/dashboard/ManagerGreetingCard";
import { SalaDeLeituraCard }        from "@/components/domain/dashboard/SalaDeLeituraCard";
import { StatusOverview }           from "@/components/domain/dashboard/StatusOverview";
import { RecentEmprestimos }        from "@/components/domain/dashboard/RecentEmprestimos";
import { ActivityChart }            from "@/components/domain/dashboard/ActivityChart";
import { LivrosMaisEmprestados }    from "@/components/domain/dashboard/LivrosMaisEmprestados";

// Interface dados do dashboard
interface DashboardData {
    totalLivros:            number;
    livrosDisponiveis:      number;
    livrosEmprestados:      number;
    totalAssociados:        number;
    associadosAtivos:       number;
    emprestimosAtivos:      number;
    emprestimosAtrasados:   number;
    recentEmprestimos:      Emprestimo[];
    topLivros:              Livro[];
    atividadeMensal:        number[];
}

/**
 * Componente dashboard da sala de leitura.
 * 
 * São exibidos uma série de informações sobre o estado atual da sala de leitura.
 * São as informações:
 *  -   quantidade de livros disponíveis
 *  -   quantidade de empréstimos
 */
export default function Dashboard() {
    //  autenticação, loading, error
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    //  estado
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalLivros: 0,
        livrosDisponiveis: 0,
        livrosEmprestados: 0,
        totalAssociados: 0,
        associadosAtivos: 0,
        emprestimosAtivos: 0,
        emprestimosAtrasados: 0,
        recentEmprestimos: [],
        topLivros: [],
        atividadeMensal: []
    });

    //  última vez online
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    /**
     * Carrega os dados do dashboard.
     */
    useEffect(() => {
    /**
     * Carrega os dados do dashboard em paralelo.
     * 
     * Faz as requisições em paralelo para obter os dados de livros, associados e empréstimos.
     * 
     * Processa os dados para calcular estatísticas e armazenar no estado do componente.
     */
      async function fetchDashboardData() {
        try {
          setLoading(true);
          setError(null);
  
          // Faz todas as requisições em paralelo
          const [
            livrosRes,
            associadosRes,
            emprestimosRes,
            emprestimosAtivosRes,
            recentEmprestimosRes
          ] = await Promise.all([
            api.get("/api/livros/"),
            api.get("/api/associados/"),
            api.get("/api/emprestimos/"),
            api.get("/api/emprestimos/ativos/"),
            api.get("/api/emprestimos/?ordering=-data_emprestimo&limit=5")
          ]);
  
          // Processa os dados
          const livros            = livrosRes.data.results || livrosRes.data;
          const associados        = associadosRes.data.results || associadosRes.data;
          const emprestimos       = emprestimosRes.data.results || emprestimosRes.data;
          const emprestimosAtivos = emprestimosAtivosRes.data.results || emprestimosAtivosRes.data;
          const recentEmprestimos = recentEmprestimosRes.data.results || recentEmprestimosRes.data;
  
          // Calcula estatísticas
          const livrosDisponiveis = livros.filter((livro: Livro) => 
            livro.status === "DISPONIVEL"
          ).length;
  
          const livrosEmprestados = livros.filter((livro: Livro) => 
            livro.status === "EMPRESTADO"
          ).length;
  
          const associadosAtivos = associados.filter((assoc: Associado) => 
            assoc.esta_ativo
          ).length;
  
          // Calcula empréstimos atrasados
          const hoje = new Date();
          const emprestimosAtrasados = emprestimosAtivos.filter((emp: Emprestimo) => {
            if (!emp.data_prevista) return false;
            const dataPrevista = new Date(emp.data_prevista);
            return dataPrevista < hoje && !emp.data_devolucao;
          }).length;
  
          // Livros mais emprestados
          const livroEmprestimoCount: Record<number, number> = {};
          emprestimos.forEach((emp: any) => {
            if (emp.livro_id) {
              livroEmprestimoCount[emp.livro_id] = (livroEmprestimoCount[emp.livro_id] || 0) + 1;
            }
          });
  
          const topLivros = Object.entries(livroEmprestimoCount)
            .map(([livroId, count]) => {
              const livro = livros.find((l: any) => l.id === parseInt(livroId));
              return livro ? { ...livro, emprestimoCount: count } : null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => b.emprestimoCount - a.emprestimoCount)
            .slice(0, 5);
  
          // Atividade mensal (simulação)
          const atividadeMensal = Array.from({ length: 12 }, (_, i) => {
            const mes = i + 1;
            const emprestimosMes = emprestimos.filter((emp: any) => {
              const data = new Date(emp.data_emprestimo);
              return data.getMonth() + 1 === mes;
            }).length;
            return {
              mes: mes.toString().padStart(2, '0'),
              emprestimos: emprestimosMes
            };
          });
  
          setDashboardData({
            totalLivros: livros.length,
            livrosDisponiveis,
            livrosEmprestados,
            totalAssociados: associados.length,
            associadosAtivos,
            emprestimosAtivos: emprestimosAtivos.length,
            emprestimosAtrasados,
            recentEmprestimos: recentEmprestimos.slice(0, 5),
            topLivros,
            atividadeMensal
          });
    
            setLastUpdated(new Date());
          } catch (err: any) {
            console.error("Erro ao carregar dashboard:", err);
            setError("Erro ao carregar dados do dashboard. Tente novamente.");
          } finally {
            setLoading(false);
          }
        }
    
        if (user) {
          fetchDashboardData();
          
          // Atualiza a cada 5 minutos
          const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
          return () => clearInterval(interval);
        }
      }, [user]);
    
      if (loading) {
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        );
      }
    
      return (
        <div className="space-y-6">
          {/* Cabeçalho do Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Visão geral da sala de leitura
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
            </div>
          </div>
    
          {/* Cartão de boas-vindas (apenas para gerentes) */}
          {(user?.is_staff || user?.is_superuser) && (
            <ManagerGreetingCard 
              user={user}
              lastLogin={new Date()}
            />
          )}
    
          {/* Cartão de status da sala de leitura */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Overview */}
            <div className="lg:col-span-2">
              <SalaDeLeituraCard
                title="Status da Sala de Leitura"
                subtitle="Resumo atual do sistema"
              >
                <StatusOverview data={dashboardData} />
              </SalaDeLeituraCard>
            </div>
    
            {/* Últimos Empréstimos */}
            <div className="lg:col-span-1">
              <SalaDeLeituraCard
                title="Últimos Empréstimos"
                subtitle="Atividade recente"
                actionText="Ver todos"
                actionLink="/emprestimos"
              >
                <RecentEmprestimos emprestimos={dashboardData.recentEmprestimos} />
              </SalaDeLeituraCard>
            </div>
          </div>
    
          {/* Segunda linha: Gráfico e Livros mais emprestados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de atividade */}
            <SalaDeLeituraCard
              title="Atividade Mensal"
              subtitle="Empréstimos por mês"
            >
              <ActivityChart data={dashboardData.atividadeMensal} />
            </SalaDeLeituraCard>
    
            {/* Livros mais emprestados */}
            <SalaDeLeituraCard
              title="Livros Mais Emprestados"
              subtitle="Top 5 do acervo"
              actionText="Ver acervo"
              actionLink="/livros"
            >
              <LivrosMaisEmprestados livros={dashboardData.topLivros} />
            </SalaDeLeituraCard>
          </div>
    
          {/* Estatísticas detalhadas (apenas para gerentes) */}
          {(user?.is_staff || user?.is_superuser) && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Estatísticas Detalhadas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Taxa de disponibilidade</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalLivros > 0 
                      ? Math.round((dashboardData.livrosDisponiveis / dashboardData.totalLivros) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Associados ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.associadosAtivos} / {dashboardData.totalAssociados}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Taxa de empréstimos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.totalAssociados > 0
                      ? Math.round((dashboardData.emprestimosAtivos / dashboardData.totalAssociados) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Empréstimos atrasados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.emprestimosAtrasados}
                  </p>
                </div>
              </div>
            </div>
          )}
    
          {/* Ações rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/livros/novo"
              className="bg-primary-50 border border-primary-200 rounded-lg p-4 hover:bg-primary-100 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3 group-hover:bg-primary-200">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-primary-900">Adicionar Livro</h3>
                  <p className="text-sm text-primary-600">Cadastre um novo livro no acervo</p>
                </div>
              </div>
            </a>
    
            <a
              href="/emprestimos/novo"
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Novo Empréstimo</h3>
                  <p className="text-sm text-green-600">Registre um empréstimo de livro</p>
                </div>
              </div>
            </a>
    
            <a
              href="/associados/novo"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Novo Associado</h3>
                  <p className="text-sm text-blue-600">Cadastre um novo associado</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      );
    }
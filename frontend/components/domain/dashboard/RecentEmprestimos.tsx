// frontend/components/dashboard/RecentEmprestimos.tsx

interface Emprestimo {
    id: number;
    livro_titulo: string;
    associado_nome: string;
    data_emprestimo: string;
    data_prevista: string;
    data_devolucao: string | null;
  }
  
  interface RecentEmprestimosProps {
    emprestimos: Emprestimo[];
  }
  
  export function RecentEmprestimos({ emprestimos }: RecentEmprestimosProps) {
    if (emprestimos.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum empréstimo recente</p>
        </div>
      );
    }
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
    };
  
    const getStatus = (dataDevolucao: string | null, dataPrevista: string) => {
      if (dataDevolucao) return { text: "Devolvido", color: "text-green-600", bg: "bg-green-100" };
      
      const hoje = new Date();
      const prevista = new Date(dataPrevista);
      
      if (hoje > prevista) return { text: "Atrasado", color: "text-red-600", bg: "bg-red-100" };
      return { text: "Ativo", color: "text-blue-600", bg: "bg-blue-100" };
    };
  
    return (
      <div className="space-y-4">
        {emprestimos.map((emp) => {
          const status = getStatus(emp.data_devolucao, emp.data_prevista);
          
          return (
            <div key={emp.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {emp.livro_titulo}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {emp.associado_nome}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-gray-400">
                    {formatDate(emp.data_emprestimo)}
                  </span>
                  {!emp.data_devolucao && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">
                        Prev: {formatDate(emp.data_prevista)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="ml-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
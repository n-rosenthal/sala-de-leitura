// frontend/components/dashboard/StatusOverview.tsx

interface StatusOverviewProps {
    data: {
      totalLivros: number;
      livrosDisponiveis: number;
      livrosEmprestados: number;
      totalAssociados: number;
      associadosAtivos: number;
      emprestimosAtivos: number;
      emprestimosAtrasados: number;
    };
  }
  
  export function StatusOverview({ data }: StatusOverviewProps) {
    const stats = [
      {
        label: "Livros Disponíveis",
        value: data.livrosDisponiveis,
        total: data.totalLivros,
        color: "text-green-600",
        bgColor: "bg-green-50",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        )
      },
      {
        label: "Empréstimos Ativos",
        value: data.emprestimosAtivos,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        )
      },
      {
        label: "Associados Ativos",
        value: data.associadosAtivos,
        total: data.totalAssociados,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )
      },
      {
        label: "Empréstimos Atrasados",
        value: data.emprestimosAtrasados,
        color: data.emprestimosAtrasados > 0 ? "text-red-600" : "text-gray-600",
        bgColor: data.emprestimosAtrasados > 0 ? "bg-red-50" : "bg-gray-50",
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      }
    ];
  
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} p-4 rounded-lg`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${stat.color.replace('text-', 'bg-').replace('600', '100')}`}>
                {stat.icon}
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  {stat.total !== undefined && (
                    <span className="text-sm text-gray-500 ml-1">
                      / {stat.total}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
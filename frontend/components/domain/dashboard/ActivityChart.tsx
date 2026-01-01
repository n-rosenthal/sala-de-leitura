/**
 *    `frontend/components/dashboard/ActivityChart.tsx`,  gráfico de empréstimos por mês
 * 
 *  Exibe um gráfico de empréstimos por mês, com barras que representam a quantidade de empréstimos em cada mês.
 *  Faz parte da rota '/dashboard'.
 */


/**
 * Propriedades do componente `ActivityChart`
 */
interface ActivityChartProps {
    data: Array<{
      mes: string;
      emprestimos: number;
    }>;
}
  

/**
 * Exibe um gráfico de empréstimos por mês, com barras que representam a quantidade de empréstimos em cada mês.
 * 
 * @param {ActivityChartProps} props - Propriedades do componente `ActivityChart`
 * @param {Array<{mes: string, emprestimos: number}>} props.data - Array com objetos contendo mês e quantidade de empréstimos em cada mês.
 * 
 * @returns {JSX.Element} - Elemento JSX do gráfico de empréstimos por mês.
 */
export function ActivityChart({ data }: ActivityChartProps) {
  // Calcula o mês com maior quantidade de empréstimos
  const maxEmprestimos = Math.max(...data.map(d => d.emprestimos), 1);
    
  return (
    <div className="space-y-4">
      {/* Legendas dos meses */}
      <div className="flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index} className="w-8 text-center">
            {item.mes}
          </span>
        ))}
      </div>
        
      {/* Barras do gráfico */}
      <div className="flex items-end justify-between h-32">
        {data.map((item, index) => {
          const height = (item.emprestimos / maxEmprestimos) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center w-8">
              <div 
                className="w-6 bg-primary-500 rounded-t-md transition-all hover:bg-primary-600"
                style={{ height: `${height}%` }}
                title={`${item.emprestimos} empréstimos`}
              >
                <div className="opacity-0 group-hover:opacity-100">
                  {/* Tooltip será mostrado no hover */}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-900">
                  {item.emprestimos}
                </span>
              </div>
            </div>
          );
        })}
      </div>
        
      {/* Legenda */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-sm"></div>
          <span className="text-sm text-gray-600">Empréstimos por mês</span>
        </div>
      </div>
    </div>
    );
  }
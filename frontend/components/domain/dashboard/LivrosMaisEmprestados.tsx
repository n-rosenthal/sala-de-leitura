// frontend/components/dashboard/LivrosMaisEmprestados.tsx

interface Livro {
    id: number;
    titulo: string;
    autor: string;
    emprestimoCount: number;
  }
  
  interface LivrosMaisEmprestadosProps {
    livros: Livro[];
  }
  
  export function LivrosMaisEmprestados({ livros }: LivrosMaisEmprestadosProps) {
    if (livros.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        {livros.map((livro, index) => (
          <div key={livro.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-50 text-primary-600 rounded-full font-semibold">
              {index + 1}
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {livro.titulo}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {livro.autor}
              </p>
            </div>
            
            <div className="ml-2 text-right">
              <span className="text-lg font-bold text-gray-900">
                {livro.emprestimoCount}
              </span>
              <p className="text-xs text-gray-500">
                empréstimo{livro.emprestimoCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
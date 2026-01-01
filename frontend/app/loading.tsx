/**
 *  `frontend/app/loading.tsx`, componente de loading global
 * 
 *  Componente de loading global 
 */


/**
 * Componente de loading global que é exibido quando a aplicação
 * está carregando. Mostra uma mensagem de carregamento e um efeito
 * de pulsa para indicar que a aplicação está processando.
 */
export default function GlobalLoading() {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg animate-pulse">Carregando aplicação…</p>
      </div>
    );
  }
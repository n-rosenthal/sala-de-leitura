'use client';

/**
 *  `frontend/app/login/error.tsx`, componente erro para rota '/login'
 * 
 *  Componente de fallback quando erros de execução/runtime ocorrerem na página '/login'
 */

import { useEffect } from 'react';

/**
 * Componente de fallback quando erros de execução/runtime ocorrerem na página '/login'
 *
 * @param {Error & { digest?: string }} error - O objeto de erro com opcionalmente uma propriedade 'digest'
 * @param {() => void} reset - Função para tentar re-renderizar o segmento novamente
 */
export default function Error({
    error,
    reset,
    }: {
    error: Error & { digest?: string }
    reset: () => void
    }) {
        useEffect(() => {
            // Imprime o erro no console
            console.error(error)
        }, [error])
        
        return (
            <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">Erro!</h2>
            <button className='text-zinc-600 dark:text-zinc-400'
                onClick={
                //  tenta recuperar-se do erro e re-renderizar
                () => reset()
                }
            >
                Tentar novamente
            </button>
            </div>
        )
}
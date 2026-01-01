/**
 *  `frontend/providers/providers.tsx`, provedor de react-query
 * 
 * Provedor de react-query para o projeto
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 *  Cliente de react-query
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        },
    },
});

/**
 * Provedor de react-query para o projeto.
 * 
 * @param {{ children: React.ReactNode }} - Filhos do provedor.
 * @returns {React.ReactNode} - Provedor de react-query com os filhos.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
        {children}
        </QueryClientProvider>
    );
}

export default Providers;
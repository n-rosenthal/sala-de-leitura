// frontend/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            //  por quanto tempo um dado continua 'fresco'/válido?
            staleTime: 60_000,

            // quantas vezes tenta refazer uma query
            retry: 2,

            // se a query falhar, tenta refazer
            refetchOnWindowFocus: true,
        },
    },
});

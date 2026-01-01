/**
 *  `frontend/app/livros/loading.tsx`, loading para `/livros`
 * 
 *  Componente de loading para `/livros`
 */

import { PageSkeleton } from "@/components/skeletons/PageSkeleton";

/**
 * Componente de loading para `/livros`.
 * 
*/
export default function Loading() {
    return <PageSkeleton />;
}

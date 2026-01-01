/**
 * `frontend/components/AuthBoundary.tsx`, componente de erro de autenticação
 * 
 * Componente de erro de autenticação
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthBoundary({ error }: { error: Error }) {
    const router = useRouter();

    useEffect(() => {
        if ((error as any)?.status === 401) {
        router.replace("/login");
        }
    }, [error, router]);

    return (
        <div className="p-6 text-center">
        <p>Você foi desconectado.</p>
        </div>
    );
}

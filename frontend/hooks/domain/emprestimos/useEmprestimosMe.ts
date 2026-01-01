import { useEffect, useState } from "react";
import api from "@/services/api";

export function useEmprestimosMe() {
    const [emprestimos, setEmprestimos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
        try {
            const res = await api.get("/api/emprestimos/me/");
            setEmprestimos(res.data.results ?? res.data);
        } catch {
            setError("Erro ao carregar empréstimos");
        } finally {
            setLoading(false);
        }
        }

        load();
    }, []);

    return { emprestimos, loading, error };
}

// frontend/app/(protected)/emprestimos/novo/page.tsx


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function NovoEmprestimoPage() {
    const [livrosDisponiveis, setLivrosDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarLivrosDisponiveis();
    }, []);

    const carregarLivrosDisponiveis = async () => {
        try {
        // Usa o endpoint específico
        const response = await api.get('/api/livros/disponiveis/');
        setLivrosDisponiveis(response.data.results || response.data);
        } catch (error) {
        console.error('Erro ao carregar livros:', error);
        } finally {
        setLoading(false);
        }
    };

  // Ou verificar individualmente
  const verificarLivro = async (livroId: string) => {
    try {
      const response = await api.get(`/api/livros/${livroId}/verificar/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar livro:', error);
      return null;
    }
  };
}
/**
 * `frontend/types/Livro.ts`
 * 
 * Tipos `Livro` e `LivroStatus` para o frontend.
 */

/**
 * Status possíveis de um Livro
 * (espelha Livro.Status no backend)
 */
export type LivroStatus =
    | "DISPONIVEL"
    | "EMPRESTADO"
    | "PARA_GUARDAR"
    | "DOADO"
    | "PERDIDO";

/**
 * Representa um livro da sala de leitura
 */
export type Livro = {
    id: string;
    titulo: string;
    autor: string;
    ano: number;
    status: LivroStatus;

    /** Regra de negócio calculada no backend */
    pode_ser_emprestado: boolean;
};
export type Associado = {
    id: number;
    nome: string;
    aniversario: string;
    esta_ativo: boolean;
    gerente: boolean;

    user_id: number | null;
    username?: string;
    email?: string;
};
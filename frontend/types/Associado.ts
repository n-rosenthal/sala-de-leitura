/**
 *  `frontend/types/Associado.ts`
 * 
 *  Definição de um Associado
 * 
 *  @see `backend/api/models/Associado.py`
 */

/**
 * Representa um associado da sala de leitura.
 * Corresponde a `AssociadoSerializer`.
 */
export interface Associado {
    //  usuário relacionado ao associado
    user: any;

    //  identificador único para um associado
    id: number;

    //  nome do associado
    nome: string;

    //  data de aniversário do associado
    aniversario: string;

    //  indica se o associado está ativo
    esta_ativo: boolean;

    //  indica se o associado é gerente
    gerente: boolean;
};
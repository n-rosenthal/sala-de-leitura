/**
 *  `frontend/types/Emprestimo.ts`
 * 
 *  Definição do tipo `Emprestimo` de um livro.
 *  O tipo `Emprestimo` segue a definição de um objeto aninhado, conforme existe no backend.
 * Portanto, um objeto `Emprestimo` contém, em si, outros objetos aninhados:
 *  - um objeto `Livro`, que é o livro a ser emprestado;
 *  - um objeto `Associado`, referente ao associado a quem é emprestado o livro;
 *  - outros dois (que podem ser o mesmo) objetos `Associado`, referentes aos gerentes (quem EMPRESTOU o livro e quem fez a DEVOLUÇÃO do livro).
 * - além disso, são armazenadas as datas (de empréstimo, de previsão de devolução, e de devolução propriamente dita, quando ocorrer).
 */

import { Livro } from "./Livro";
import { Associado } from "./Associado";

/**
 *  Interface `Emprestimo` de um livro a um associado.
 */
export interface Emprestimo<Livro, Associado> {
    //  identificador único de um empréstimo
    id: number;

    //  livro a ser emprestado
    livro: Livro;

    //  associado a quem é emprestado o livro
    associado: Associado;

    //  data em que o livro foi emprestado
    data_emprestimo: Date;

    //  data em que o livro deveria ser devolvido
    data_prevista: Date;

    //  data em que o livro foi devolvido
    data_devolucao: Date;

    //  quem emprestou o livro
    quem_emprestou: Associado;

    //  quem devolveu o livro
    quem_devolveu: Associado;
}
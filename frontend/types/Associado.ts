/**
 * `types/Associado.ts`
 *
 * Espelha o modelo Django `Associado` (OneToOne → User).
 * Estrutura retornada pelo endpoint `/api/auth/me/` e `/api/associados/`.
 */

// User (Django auth.User)
export interface DjangoUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;        // acesso ao Django Admin
  is_superuser: boolean;    // todas as permissões
  is_active: boolean;
}

// Associado
export interface Associado {
  id: number;
  user: DjangoUser;

  // Campos do modelo Associado
  aniversario: string;      // ISO date: "YYYY-MM-DD"
  telefone: string;

  // Properties serializadas pelo backend
  nome_completo: string;    // user.get_full_name()
  email: string;            // user.email
  esta_ativo: boolean;      // user.is_active
}

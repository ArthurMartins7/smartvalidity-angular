import { PerfilAcesso } from "../enum/perfil-acesso.enum";

export class Usuario {
  id: string;
  perfilAcesso: PerfilAcesso;
  cpf: string;
  nome: string;
  email: string;
  senha: string;

  // Campos do Spring Security que não devem ser serializados
  authorities?: any[];
  enabled?: boolean;
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  accountNonLocked?: boolean;
  password?: string;
  username?: string;
}

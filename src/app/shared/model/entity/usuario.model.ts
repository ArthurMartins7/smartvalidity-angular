import { PerfilAcesso } from "../enum/perfil-acesso.enum";
import { Empresa } from "./empresa";

export class Usuario {
  id: string;
  perfilAcesso: PerfilAcesso;
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  empresa: Empresa;

  // Campos do Spring Security que não devem ser serializados
  authorities?: any[];
  enabled?: boolean;
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  accountNonLocked?: boolean;
  password?: string;
  username?: string;
}

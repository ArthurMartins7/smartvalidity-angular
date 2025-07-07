import { PerfilAcesso } from "../enum/perfil-acesso.enum";

export class UsuarioConviteDTO {
  perfilAcesso: PerfilAcesso; // use PerfilAcesso enum when available to avoid circular import
  nome: string;
  email: string;
  cargo: string;
}

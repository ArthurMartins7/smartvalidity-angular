import { PerfilAcesso } from "../enum/perfil-acesso.enum";

export class Usuario {
  perfilAcesso: PerfilAcesso;
  cpf: string;
  nome: string;
  email: string;
  senha: string;
}

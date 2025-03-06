import { PerfilAcesso } from "../enum/perfil-acesso.enum";

export class Usuario {
  id: string;
  perfilAcesso: PerfilAcesso;
  cpf: string;
  nome: string;
  email: string;
  senha: string;
}

import { Usuario } from "./usuario.model";

export class Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  usuarios: Usuario[];
}
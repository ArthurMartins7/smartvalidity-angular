import { Usuario } from "../entity/usuario.model";

export class CorredorDTO{
  id: number;
  nome: string;
  responsaveis: Usuario[];
}

import { Categoria } from './categoria';
import { Usuario } from './usuario.model';

export class Corredor{
  id: number;
  nome: string;
  responsaveis: Usuario[];
  categorias: Categoria[];
}

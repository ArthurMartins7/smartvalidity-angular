import { Categoria } from './categoria';
import { Usuario } from './usuario.model';

export class Corredor{
  id: number;
  nome: string;
  responsaveis: Usuario[];
  categorias: Categoria[];
  imagemEmBase64: string | null;

  constructor() {
    this.responsaveis = [];
    this.categorias = [];
    this.imagemEmBase64 = null;
  }
}

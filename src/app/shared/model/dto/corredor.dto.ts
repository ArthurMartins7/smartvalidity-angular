import { Categoria } from "../entity/categoria";

export class CorredorDTO {
  id?: number;
  nome: string;
  imagemEmBase64: string | null;
  responsaveis: { id: string }[];
  categorias: Categoria[];

  constructor() {
    this.responsaveis = [];
    this.categorias = [];
    this.imagemEmBase64 = null;
  }
}

import { Endereco } from "./endereco";
import { Produto } from "./produto";

export class Fornecedor{
  id: string;
  nome: string;
  telefone: string;
  cnpj: string;
  endereco: Endereco;
  produtos: Produto[] = [];

  constructor() {
    this.produtos = [];
  }
}

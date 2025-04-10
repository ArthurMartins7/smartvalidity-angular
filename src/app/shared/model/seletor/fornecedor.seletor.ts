import { BaseSeletor } from "./base.seletor";

export class FornecedorSeletor extends BaseSeletor {
  nome: string = '';
  telefone: string = '';
  cnpj: string = '';
  descricaoProduto: string = '';
  override pagina: number = 1;
  override limite: number = 5;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  cep: string;
}

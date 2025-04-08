import { Produto } from "../entity/produto";
import { BaseSeletor } from "./base.seletor";

export class FornecedorSeletor extends BaseSeletor {
  nome: string;
  telefone: string;
  cnpj: string;
  produto: Produto[];
}

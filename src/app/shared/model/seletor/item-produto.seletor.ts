import { BaseSeletor } from "./base.seletor";
// import { Produto } from "./produto";

export class ItemProdutoSeletor extends BaseSeletor {
  lote?: string;
  precoCompraMin?: number;
  precoCompraMax?: number;
  precoVendaMin?: number;
  precoVendaMax?: number;
  dataFabricacaoInicio?: string;
  dataFabricacaoFim?: string;
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  dataRecebimentoInicio?: string;
  dataRecebimentoFim?: string;
  produtoId?: number;

  // produtoDescricao?: string;
}

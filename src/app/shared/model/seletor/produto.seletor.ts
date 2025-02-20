import { BaseSeletor } from "./base.seletor";
// import { Categoria } from "./categoria";
// import { ItemProduto } from "./item-produto";
// import { Fornecedor } from "./fornecedor";
// import { Alerta } from "./alerta";

export class ProdutoSeletor extends BaseSeletor {
  codigoBarras?: string;
  descricao?: string;
  marca?: string;
  unidadeMedida?: string;
  quantidadeMin?: number;
  quantidadeMax?: number;
  categoriaId?: number;
  categoriaNome?: string;

  // itemProdutoId?: number;
  // itemProdutoLote?: string;
  // fornecedorId?: number;
  // fornecedorNome?: string;
  // alertaId?: number;
  // alertaDescricao?: string;
}

import { CategoriaDTO } from "./categoria.dto";
// import { ItemProdutoDTO } from "./item-produto.dto";
// import { FornecedorDTO } from "./fornecedor.dto";
// import { AlertaDTO } from "./alerta.dto";

export class ProdutoDTO {
  id!: string;
  codigoBarras!: string;
  descricao!: string;
  marca!: string;
  unidadeMedida!: string;
  quantidade!: number;
  categoria!: CategoriaDTO;

  // itensProduto!: ItemProdutoDTO[];
  // fornecedores!: FornecedorDTO[];
  // alertas!: AlertaDTO[];

}


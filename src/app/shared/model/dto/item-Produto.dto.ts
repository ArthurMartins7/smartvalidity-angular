import { ProdutoDTO } from "./produto.dto";

export class ItemProdutoDTO {
  id?: string;
  lote!: string;
  precoCompra?: number;
  precoVenda!: number;
  dataFabricacao!: string;
  dataVencimento!: string;
  dataRecebimento!: string;
  produto!: ProdutoDTO;
  quantidade?: number;
}


import { Produto } from "./produto";

export class ItemProduto {
    id!: number;
    lote!: string;
    precoCompra!: number;
    precoVenda!: number;
    dataFabricacao!: Date;
    dataVencimento!: Date;
    dataRecebimento!: Date;
    produto!: Produto;

    constructor(init?: Partial<ItemProduto>) {
        Object.assign(this, init);
    }
}

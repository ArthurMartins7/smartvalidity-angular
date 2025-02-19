import { Categoria } from "../model/categoria";
//import { ItemProduto } from "./item-produto";
//import { Fornecedor } from "./fornecedor";
//import { Alerta } from "./alerta";

export class Produto {
    id!: number;
    codigoBarras!: string;
    descricao!: string;
    marca!: string;
    unidadeMedida!: string;
    quantidade!: number;
    categoria!: Categoria;
//    itensProduto!: ItemProduto[];
//    fornecedores!: Fornecedor[];
//    alertas!: Alerta[];

    constructor(init?: Partial<Produto>) {
        Object.assign(this, init);
    }
}

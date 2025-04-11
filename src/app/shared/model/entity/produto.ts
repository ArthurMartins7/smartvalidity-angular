import { Categoria } from "./categoria";
import { Fornecedor } from "./fornecedor";
import { ItemProduto } from "./itemProduto";

export class Produto {
    id: string;
    codigoBarras: string;
    descricao: string;
    marca: string;
    unidadeMedida: string;
    quantidade: number;
    categoria: Categoria;
    itensProduto: ItemProduto[];
    fornecedores: Fornecedor[];
    //alertas: Alerta[];
}

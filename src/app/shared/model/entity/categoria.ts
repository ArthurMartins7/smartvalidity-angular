import { Corredor } from "./corredor";
import { Produto } from "./produto";

export class Categoria {
    id: number;
    nome: string;
    corredor: Corredor;
    produtos: Produto[];

}

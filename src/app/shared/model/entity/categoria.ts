import { Produto } from "./produto";

export class Categoria {
    id: string;
    nome: string;
    corredor: { id: string }; // Apenas o ID do corredor
    produtos: Produto[];
}




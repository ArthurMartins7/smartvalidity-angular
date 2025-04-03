import { Produto } from "./produto";

export class Categoria {
    id: number;
    nome: string;
    corredor: { id: number }; // Apenas o ID do corredor
    produtos: Produto[];
}




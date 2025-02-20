import { ProdutoDTO } from "./produto.dto";
// import { CorredorDTO } from "./corredor.dto";

export class CategoriaDTO {
  id!: number;
  nome!: string;
  produtos!: ProdutoDTO[];
  // corredor!: CorredorDTO;


}

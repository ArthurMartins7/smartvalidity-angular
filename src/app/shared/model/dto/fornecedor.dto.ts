import { EnderecoDTO } from "./endereco.dto";
import { ProdutoDTO } from "./produto.dto";

export class FornecedorDTO{

  id: number;
  nome: string;
  telefone: string;
  cnpj: string;
  endereco: EnderecoDTO;
  produtos: ProdutoDTO[];
}

import { EnderecoDTO } from "./endereco.dto";

export class FornecedorDTO{

  id: number;
  nome: string;
  telefone: string;
  cnpj: string;
  endereco: EnderecoDTO;
}

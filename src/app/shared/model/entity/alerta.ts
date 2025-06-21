import { TipoAlerta } from "../enum/tipo-alerta.enum";
import { Usuario } from "./usuario.model";
import { Produto } from "./produto";

export class Alerta {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoAlerta;
  dataHoraCriacao: Date;
  dataHoraDisparo: Date;
  diasAntecedencia: number;
  ativo: boolean;
  recorrente: boolean;
  configuracaoRecorrencia: string;
  usuariosCriadores: Usuario[];
  produtos: Produto[];
} 
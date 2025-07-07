import { TipoAlerta } from "../enum/tipo-alerta.enum";
import { Produto } from "./produto";
import { Usuario } from "./usuario.model";

export class Alerta {
  id: number;
  titulo: string;
  descricao: string;
  tipo: TipoAlerta;
  dataHoraCriacao: Date;
  dataHoraDisparo: Date;
  usuariosCriadores: Usuario[];
  produtos: Produto[];
}

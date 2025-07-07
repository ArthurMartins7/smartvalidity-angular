import { TipoAlerta } from "../enum/tipo-alerta.enum";
import { BaseSeletor } from "./base.seletor";

export class AlertaSeletor extends BaseSeletor {
  titulo?: string;
  tipo?: TipoAlerta;
  dataInicialDisparo?: Date;
  dataFinalDisparo?: Date;
  usuarioCriador?: string;
}

import { TipoAlerta } from "../enum/tipo-alerta.enum";

export namespace NotificacaoDTO {

  export class Listagem {
    notificacaoId!: number;
    alertaId!: number;
    titulo!: string;
    descricao!: string;
    dataHoraDisparo!: Date;
    tipo!: TipoAlerta;
    dataCriacaoAlerta!: Date;
    dataCriacaoNotificacao!: Date;
    dataHoraLeitura?: Date;
    usuarioCriador?: string;
    usuariosAlerta?: string[];
    produtosAlerta?: string[];
    usuariosAlertaIds?: string[];
    produtosAlertaIds?: string[];
    lida!: boolean;
  }
}

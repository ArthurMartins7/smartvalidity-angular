import { TipoAlerta } from "../enum/tipo-alerta.enum";

export namespace NotificacaoDTO {

  export class Listagem {
    notificacaoId!: number; // ID da notificação
    alertaId!: number; // ID do alerta relacionado
    titulo!: string;
    descricao!: string;
    dataHoraDisparo!: Date;
    tipo!: TipoAlerta;
    diasAntecedencia?: number;
    ativo!: boolean;
    recorrente!: boolean;
    configuracaoRecorrencia?: string;
    dataCriacaoAlerta!: Date; // Data de criação do alerta
    dataCriacaoNotificacao!: Date; // Data de criação da notificação
    dataHoraLeitura?: Date; // Data/hora que foi lida
    usuarioCriador?: string; // Nome do usuário criador
    usuariosAlerta?: string[]; // Nomes dos usuários
    produtosAlerta?: string[]; // Nomes dos produtos
    usuariosAlertaIds?: string[]; // IDs dos usuários
    produtosAlertaIds?: string[]; // IDs dos produtos
    lida!: boolean; // Status de leitura da notificação
  }
}

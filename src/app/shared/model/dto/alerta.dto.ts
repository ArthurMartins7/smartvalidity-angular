import { TipoAlerta } from "../enum/tipo-alerta.enum";

export namespace AlertaDTO {

  export class Listagem {
    id!: number;
    titulo!: string;
    descricao!: string;
    dataHoraDisparo!: Date;
    tipo!: TipoAlerta;
    diasAntecedencia?: number;
    ativo!: boolean;
    recorrente!: boolean;
    configuracaoRecorrencia?: string;
    dataCriacao!: Date;
    dataEnvio?: Date;
    usuarioCriador?: string; // Nome do usuário criador
    usuariosAlerta?: string[]; // Nomes
    produtosAlerta?: string[]; // Nomes
    usuariosAlertaIds?: string[]; // IDs
    produtosAlertaIds?: string[]; // IDs
    produto?: { id: number; nome: string }; // Produto individual para compatibilidade
    lida?: boolean; // Status de leitura da notificação
  }

  export class Cadastro {
    titulo!: string;
    descricao!: string;
    dataHoraDisparo!: Date;
    tipo!: TipoAlerta;
    diasAntecedencia?: number;
    recorrente?: boolean;
    configuracaoRecorrencia?: string;
    usuariosIds?: string[]; // IDs dos usuários que receberão o alerta
    produtosIds?: string[]; // IDs dos produtos relacionados (opcional)
  }

  export class Edicao {
    titulo!: string;
    descricao!: string;
    dataHoraDisparo!: Date;
    diasAntecedencia?: number;
    ativo?: boolean;
    recorrente?: boolean;
    configuracaoRecorrencia?: string;
    usuariosIds?: string[];
    produtosIds?: string[];
  }

  export class Filtro {
    titulo?: string;
    tipo?: TipoAlerta;
    ativo?: boolean;
    recorrente?: boolean;
    dataInicialDisparo?: Date;
    dataFinalDisparo?: Date;
    usuarioCriador?: string;
    pagina?: number;
    limite?: number;
    sortBy?: string;
    sortDirection?: string;
  }
}

import { TipoAlerta } from "../enum/tipo-alerta.enum";

export namespace AlertaDTO {

  export class Listagem {
    id!: number;
    titulo!: string;
    descricao!: string;
    dataHoraDisparo!: Date;
    tipo!: TipoAlerta;
    dataCriacao!: Date;
    dataEnvio?: Date;
    usuarioCriador?: string;
    usuariosAlerta?: string[];
    produtosAlerta?: string[];
    usuariosAlertaIds?: string[];
    produtosAlertaIds?: string[];
    produto?: { id: number; nome: string };
    lida?: boolean;
    itemInspecionado?: boolean;
    diasVencidos?: number;
    dataVencimentoItem?: Date;
  }

  export class Cadastro {
    titulo!: string;
    descricao!: string;
    tipo!: TipoAlerta;
    usuariosIds?: string[];
    produtosIds?: string[];
  }

  export class Edicao {
    titulo!: string;
    descricao!: string;
    usuariosIds?: string[];
    produtosIds?: string[];
  }

  export class Filtro {
    titulo?: string;
    tipo?: TipoAlerta;
    dataInicialDisparo?: Date;
    dataFinalDisparo?: Date;
    usuarioCriador?: string;
    pagina?: number;
    limite?: number;
    sortBy?: string;
    sortDirection?: string;
  }
}

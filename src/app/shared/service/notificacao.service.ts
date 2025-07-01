import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AlertaDTO } from '../model/dto/alerta.dto';
import { TipoAlerta } from '../model/enum/tipo-alerta.enum';


@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private readonly API_URL = 'http://localhost:8080/smartvalidity/api/notificacoes';


  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
  }


  buscarNotificacoes(): Observable<AlertaDTO.Listagem[]> {
    return this.http.get<AlertaDTO.Listagem[]>(this.API_URL);
  }


  buscarNotificacaoPorId(id: number): Observable<AlertaDTO.Listagem> {
    return this.http.get<AlertaDTO.Listagem>(`${this.API_URL}/${id}`);
  }


  buscarNotificacoesNaoLidas(): Observable<AlertaDTO.Listagem[]> {
    return this.http.get<AlertaDTO.Listagem[]>(`${this.API_URL}/nao-lidas`);
  }


  contarNotificacoesNaoLidas(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count-nao-lidas`);
  }


  marcarComoLida(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/marcar-lida`, {})
      .pipe(
        tap(() => {
          this.atualizarContadorNaoLidas();
        })
      );
  }


  marcarTodasComoLidas(): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/marcar-todas-lidas`, {})
      .pipe(
        tap(() => {
          this.unreadCountSubject.next(0);
        })
      );
  }


  excluirNotificacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => {
          this.atualizarContadorNaoLidas();
        })
      );
  }


  atualizarContadorNaoLidas(): void {
    this.contarNotificacoesNaoLidas().subscribe({
      next: (count) => {
        this.unreadCountSubject.next(count || 0);
      },
      error: (error) => {
        this.unreadCountSubject.next(0);
      }
    });
  }


  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }


  hasUnreadNotifications(): boolean {
    return this.unreadCountSubject.value > 0;
  }

  /**
   * Extrai informações do produto e lote da descrição da notificação
   * @param descricao Descrição da notificação
   * @returns Informações do item ou null se não encontrar
   */
  extrairInfoItem(descricao: string): { produto: string, lote: string } | null {
    if (!descricao) return null;

    // Padrão: "O item 'Nome do Produto' (Lote: LOTE123)"
    const regex = /O item '([^']+)'\s*\(Lote:\s*([^)]+)\)/i;
    const match = descricao.match(regex);

    if (match) {
      return {
        produto: match[1].trim(),
        lote: match[2].trim()
      };
    }

    return null;
  }

  /**
   * Determina a aba do mural baseada no tipo de alerta
   * RESPONSABILIDADE SERVICE: Lógica de mapeamento de domínio
   * @param tipo Tipo do alerta
   * @returns Nome da aba do mural
   */
  determinarAbaMural(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_ATRASO:
        return 'vencido';
      case TipoAlerta.VENCIMENTO_HOJE:
        return 'hoje';
      case TipoAlerta.VENCIMENTO_AMANHA:
      default:
        return 'proximo';
    }
  }

  /**
   * Verifica se uma notificação possui informações de item que podem ser visualizadas
   * @param notificacao Notificação a ser verificada
   * @returns true se pode visualizar item, false caso contrário
   */
  podeVisualizarItem(notificacao: AlertaDTO.Listagem | null): boolean {
    if (!notificacao || !notificacao.descricao) return false;
    return this.extrairInfoItem(notificacao.descricao) !== null;
  }

  /**
   * Busca um item específico por produto e lote usando filtros
   * RESPONSABILIDADE SERVICE: Lógica de busca e resolução de dados
   * @param produto Nome do produto
   * @param lote Lote do produto
   * @returns Observable com array de itens encontrados
   */
  buscarItemPorProdutoELote(produto: string, lote: string): Observable<any[]> {
    const filtro = {
      searchTerm: produto,  // Campo correto para busca de texto (produto)
      lote: lote,           // Campo específico para filtro de lote
      limite: 2,            // Buscar apenas 2 para verificar se é único
      pagina: 1
    };

    return this.http.post<any[]>('http://localhost:8080/smartvalidity/mural/filtrar', filtro);
  }

  /**
   * Gera os parâmetros de query para navegação no mural com filtros aplicados
   * @param notificacao Notificação com informações do item
   * @returns Parâmetros de query para o mural ou null se não conseguir extrair
   */
  gerarParametrosMural(notificacao: AlertaDTO.Listagem): { [key: string]: string } | null {
    if (!notificacao || !notificacao.descricao) return null;

    const infoItem = this.extrairInfoItem(notificacao.descricao);
    if (!infoItem) return null;

    const tab = this.determinarAbaMural(notificacao.tipo);

    return {
      tab: tab,
      search: infoItem.produto,
      lote: infoItem.lote
    };
  }

  /**
   * Tenta navegar para o detalhe específico do item, ou fallback para listagem
   * RESPONSABILIDADE SERVICE: Lógica de decisão de navegação
   * @param notificacao Notificação com informações do item
   * @returns Observable com dados para navegação { tipo: 'detalhe' | 'listagem', dados: any }
   */
  obterDadosNavegacaoItem(notificacao: AlertaDTO.Listagem): Observable<{ tipo: 'detalhe' | 'listagem', dados: any }> {
    if (!notificacao || !notificacao.descricao) {
      return of({ tipo: 'listagem', dados: null });
    }

    const infoItem = this.extrairInfoItem(notificacao.descricao);
    if (!infoItem) {
      return of({ tipo: 'listagem', dados: null });
    }

    // Tentar buscar item específico
    return this.buscarItemPorProdutoELote(infoItem.produto, infoItem.lote).pipe(
      map(itens => {
        if (itens && itens.length === 1) {
          // Item único encontrado - navegar para detalhe
          const tab = this.determinarAbaMural(notificacao.tipo);
          return {
            tipo: 'detalhe' as const,
            dados: {
              itemId: itens[0].id,
              queryParams: { tab }
            }
          };
        } else {
          // Múltiplos itens ou nenhum - navegar para listagem filtrada
          return {
            tipo: 'listagem' as const,
            dados: this.gerarParametrosMural(notificacao)
          };
        }
      }),
      catchError(() => {
        // Em caso de erro, usar fallback para listagem
        return of({
          tipo: 'listagem' as const,
          dados: this.gerarParametrosMural(notificacao)
        });
      })
    );
  }

  /**
   * Gera parâmetros básicos para navegação no mural (sem filtros específicos)
   * RESPONSABILIDADE SERVICE: Lógica de geração de parâmetros
   * @param tipo Tipo do alerta
   * @returns Parâmetros de query básicos
   */
  gerarParametrosMuralBasico(tipo: TipoAlerta): { tab: string } {
    return {
      tab: this.determinarAbaMural(tipo)
    };
  }

    /**
   * Obtém a descrição textual do tipo de alerta
   * RESPONSABILIDADE SERVICE: Formatação e apresentação de dados de domínio
   * @param tipo Tipo do alerta
   * @returns Descrição do tipo
   */
  obterDescricaoTipo(tipo: TipoAlerta): string {
    // Mapeamento tipado conforme o enum
    const tipos: Record<TipoAlerta, string> = {
      [TipoAlerta.VENCIMENTO_AMANHA]: 'Vence Amanhã',
      [TipoAlerta.VENCIMENTO_HOJE]: 'Vence Hoje',
      [TipoAlerta.VENCIMENTO_ATRASO]: 'Vencido',
      [TipoAlerta.PERSONALIZADO]: 'Personalizado'
    };

    return tipos[tipo] || 'Desconhecido';
  }

  /**
   * Obtém as classes CSS para estilização do tipo de alerta
   * RESPONSABILIDADE SERVICE: Lógica de apresentação e styling
   * @param tipo Tipo do alerta
   * @returns Classes CSS
   */
  obterCorTipo(tipo: TipoAlerta): string {
    // Mapeamento tipado conforme o enum
    const cores: Record<TipoAlerta, string> = {
      [TipoAlerta.VENCIMENTO_AMANHA]: 'bg-yellow-100 text-yellow-800',
      [TipoAlerta.VENCIMENTO_HOJE]: 'bg-orange-100 text-orange-800',
      [TipoAlerta.VENCIMENTO_ATRASO]: 'bg-red-100 text-red-800',
      [TipoAlerta.PERSONALIZADO]: 'bg-blue-100 text-blue-800'
    };

    return cores[tipo] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Calcula o tempo decorrido de forma relativa
   * RESPONSABILIDADE SERVICE: Lógica de cálculo e formatação temporal
   * @param data Data a ser comparada
   * @returns String com tempo relativo (ex: "há 2 horas")
   */
  obterTempoRelativo(data: Date): string {
    if (!data) return '';

    const agora = new Date();
    const dataNotificacao = new Date(data);
    const diferencaMs = agora.getTime() - dataNotificacao.getTime();
    const diferencaMin = Math.floor(diferencaMs / (1000 * 60));
    const diferencaHoras = Math.floor(diferencaMin / 60);
    const diferencaDias = Math.floor(diferencaHoras / 24);

    if (diferencaMin < 1) return 'agora mesmo';
    if (diferencaMin < 60) return `há ${diferencaMin} min`;
    if (diferencaHoras < 24) return `há ${diferencaHoras}h`;
    if (diferencaDias === 1) return 'há 1 dia';
    if (diferencaDias < 7) return `há ${diferencaDias} dias`;

    // Fallback para datas muito antigas
    return dataNotificacao.toLocaleDateString('pt-BR');
  }

  /**
   * Formata apenas a data (sem hora) para exibição
   * RESPONSABILIDADE SERVICE: Formatação e localização de dados
   * @param data Data a ser formatada
   * @returns Data formatada em pt-BR (dd/mm/aaaa)
   */
  formatarData(data: Date): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  /**
   * Formata data/hora para exibição padrão
   * RESPONSABILIDADE SERVICE: Formatação e localização de dados
   * @param data Data a ser formatada
   * @returns Data formatada em pt-BR
   */
  formatarDataHora(data: Date): string {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
  }

  /**
   * Remove emojis do título de alertas/notificações para exibição limpa
   * RESPONSABILIDADE SERVICE: Lógica de formatação e processamento de dados
   * PRINCÍPIO MVC: Centraliza lógica reutilizável, evitando duplicação nos COMPONENTS
   * @param titulo Título original com possíveis emojis
   * @returns Título sem emojis, com espaços extras removidos
   */
  removerEmojis(titulo: string): string {
    if (!titulo) return '';
    // Remove emojis comuns dos alertas/notificações usando regex Unicode
    return titulo.replace(/🔴|🚨|⚠️|📦|🟡|⭕|●|❗|‼️|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
  }
}

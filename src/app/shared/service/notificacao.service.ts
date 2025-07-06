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

  buscarNotificacoesPendentes(): Observable<AlertaDTO.Listagem[]> {
    return this.http.get<AlertaDTO.Listagem[]>(`${this.API_URL}/pendentes`);
  }

  buscarNotificacoesJaResolvidas(): Observable<AlertaDTO.Listagem[]> {
    return this.http.get<AlertaDTO.Listagem[]>(`${this.API_URL}/ja-resolvidas`);
  }

  contarNotificacoesPendentes(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count-pendentes`);
  }

  excluirNotificacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => {
          this.atualizarContadorPendentes();
        })
      );
  }

  atualizarContadorPendentes(): void {
    this.contarNotificacoesPendentes().subscribe({
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

  extrairInfoItem(descricao: string): { produto: string, lote: string } | null {
    if (!descricao) return null;
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

  podeVisualizarItem(notificacao: AlertaDTO.Listagem | null): boolean {
    if (!notificacao || !notificacao.descricao) return false;
    return this.extrairInfoItem(notificacao.descricao) !== null;
  }

  buscarItemPorProdutoELote(produto: string, lote: string): Observable<any[]> {
    const filtro = {
      searchTerm: produto,
      lote: lote,
      limite: 2,
      pagina: 1
    };
    return this.http.post<any[]>('http://localhost:8080/smartvalidity/mural/filtrar', filtro);
  }

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

  obterDadosNavegacaoItem(notificacao: AlertaDTO.Listagem): Observable<{ tipo: 'detalhe' | 'listagem', dados: any }> {
    if (!notificacao || !notificacao.descricao) {
      return of({ tipo: 'listagem', dados: null });
    }
    const infoItem = this.extrairInfoItem(notificacao.descricao);
    if (!infoItem) {
      return of({ tipo: 'listagem', dados: null });
    }
    return this.buscarItemPorProdutoELote(infoItem.produto, infoItem.lote).pipe(
      map(itens => {
        if (itens && itens.length === 1) {
          const tab = this.determinarAbaMural(notificacao.tipo);
          return {
            tipo: 'detalhe' as const,
            dados: {
              itemId: itens[0].id,
              queryParams: { tab }
            }
          };
        } else {
          return {
            tipo: 'listagem' as const,
            dados: this.gerarParametrosMural(notificacao)
          };
        }
      }),
      catchError(() => {
        return of({
          tipo: 'listagem' as const,
          dados: this.gerarParametrosMural(notificacao)
        });
      })
    );
  }

  gerarParametrosMuralBasico(tipo: TipoAlerta): { tab: string } {
    return {
      tab: this.determinarAbaMural(tipo)
    };
  }

  obterDescricaoTipo(tipo: TipoAlerta): string {
    const tipos: Record<TipoAlerta, string> = {
      [TipoAlerta.VENCIMENTO_AMANHA]: 'Vence Amanhã',
      [TipoAlerta.VENCIMENTO_HOJE]: 'Vence Hoje',
      [TipoAlerta.VENCIMENTO_ATRASO]: 'Vencido',
      [TipoAlerta.PERSONALIZADO]: 'Personalizado'
    };
    return tipos[tipo] || 'Desconhecido';
  }

  obterCorTipo(tipo: TipoAlerta): string {
    const cores: Record<TipoAlerta, string> = {
      [TipoAlerta.VENCIMENTO_AMANHA]: 'bg-yellow-50 text-yellow-700',
      [TipoAlerta.VENCIMENTO_HOJE]: 'bg-orange-50 text-orange-700',
      [TipoAlerta.VENCIMENTO_ATRASO]: 'bg-red-50 text-red-700',
      [TipoAlerta.PERSONALIZADO]: 'bg-blue-50 text-blue-700'
    };
    return cores[tipo] || 'bg-gray-50 text-gray-700';
  }

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
    return dataNotificacao.toLocaleDateString('pt-BR');
  }

  formatarData(data: Date): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: Date): string {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
  }

  removerEmojis(titulo: string): string {
    if (!titulo) return '';
    return titulo.replace(/🔴|🚨|⚠️|📦|🟡|⭕|●|❗|‼️|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
  }
}

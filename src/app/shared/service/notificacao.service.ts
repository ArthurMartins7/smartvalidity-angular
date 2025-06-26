import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AlertaDTO } from '../model/dto/alerta.dto';

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  private readonly API_URL = 'http://localhost:8080/api/notificacoes';

  // Subject para controlar a contagem de notificações não lidas
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Não atualiza automaticamente no construtor para evitar erros iniciais
    // O contador será atualizado quando necessário
  }

  /**
   * Buscar todas as notificações do usuário atual
   */
  buscarNotificacoes(): Observable<AlertaDTO.Listagem[]> {
    return this.http.get<AlertaDTO.Listagem[]>(this.API_URL);
  }

  /**
   * Buscar apenas notificações não lidas do usuário atual
   */
  buscarNotificacoesNaoLidas(): Observable<AlertaDTO.Listagem[]> {
    return this.http.get<AlertaDTO.Listagem[]>(`${this.API_URL}/nao-lidas`);
  }

  /**
   * Contar notificações não lidas do usuário atual
   */
  contarNotificacoesNaoLidas(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count-nao-lidas`);
  }

  /**
   * Marcar uma notificação como lida
   */
  marcarComoLida(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/marcar-lida`, {})
      .pipe(
        tap(() => {
          // Atualizar contador após marcar como lida
          this.atualizarContadorNaoLidas();
        })
      );
  }

  /**
   * Marcar todas as notificações do usuário como lidas
   */
  marcarTodasComoLidas(): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/marcar-todas-lidas`, {})
      .pipe(
        tap(() => {
          // Zerar contador após marcar todas como lidas
          this.unreadCountSubject.next(0);
        })
      );
  }

  /**
   * Atualizar o contador de notificações não lidas
   */
  atualizarContadorNaoLidas(): void {
    this.contarNotificacoesNaoLidas().subscribe({
      next: (count) => {
        this.unreadCountSubject.next(count || 0);
      },
      error: (error) => {
        // Silenciosamente define contador como 0 em caso de qualquer erro
        this.unreadCountSubject.next(0);
      }
    });
  }

  /**
   * Obter o valor atual do contador de não lidas
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Verificar se há notificações não lidas
   */
  hasUnreadNotifications(): boolean {
    return this.unreadCountSubject.value > 0;
  }
}

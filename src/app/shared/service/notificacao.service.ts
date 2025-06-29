import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AlertaDTO } from '../model/dto/alerta.dto';


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
}

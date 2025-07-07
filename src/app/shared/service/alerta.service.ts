import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AlertaDTO } from '../model/dto/alerta.dto';
import { AlertaSeletor } from '../model/seletor/alerta.seletor';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly API = `${API_URL}/alertas`;

  constructor(private httpClient: HttpClient) {}

  criarAlerta(alerta: AlertaDTO.Cadastro): Observable<AlertaDTO.Listagem> {
    return this.httpClient.post<AlertaDTO.Listagem>(this.API, alerta).pipe(
      tap({
        next: (response) => console.log('Alerta criado:', response),
        error: (error) => console.error('Erro ao criar alerta:', error)
      })
    );
  }

  buscarPorId(id: number): Observable<AlertaDTO.Listagem> {
    return this.httpClient.get<AlertaDTO.Listagem>(`${this.API}/${id}`).pipe(
      tap({
        next: (response) => console.log('Alerta encontrado:', response),
        error: (error) => console.error('Erro ao buscar alerta:', error)
      })
    );
  }

  buscarComFiltros(seletor: AlertaSeletor): Observable<AlertaDTO.Listagem[]> {
    return this.httpClient.post<AlertaDTO.Listagem[]>(`${this.API}/filtro`, seletor).pipe(
      tap({
        next: (response) => console.log('Alertas filtrados:', response),
        error: (error) => console.error('Erro ao filtrar alertas:', error)
      })
    );
  }

  atualizarAlerta(id: number, alerta: AlertaDTO.Edicao): Observable<AlertaDTO.Listagem> {
    return this.httpClient.put<AlertaDTO.Listagem>(`${this.API}/${id}`, alerta).pipe(
      tap({
        next: (response) => console.log('Alerta atualizado:', response),
        error: (error) => console.error('Erro ao atualizar alerta:', error)
      })
    );
  }

  contarAlertas(seletor: AlertaSeletor): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/contar`, seletor).pipe(
      tap({
        next: (count) => console.log('Total de alertas:', count),
        error: (error) => console.error('Erro ao contar alertas:', error)
      })
    );
  }

  listarTodos(): Observable<AlertaDTO.Listagem[]> {
    return this.httpClient.get<AlertaDTO.Listagem[]>(this.API).pipe(
      tap({
        next: (response) => console.log('Lista de alertas:', response),
        error: (error) => console.error('Erro ao listar alertas:', error)
      })
    );
  }

  contarTotalRegistros(seletor: AlertaSeletor): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/contar-registros`, seletor).pipe(
      tap({
        next: (response) => console.log('Total de alertas:', response),
        error: (error) => console.error('Erro ao contar alertas:', error)
      })
    );
  }

  excluirAlerta(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`).pipe(
      tap({
        next: () => console.log('Alerta excluído com sucesso'),
        error: (error) => console.error('Erro ao excluir alerta:', error)
      })
    );
  }

  buscarAlertasAtivos(): Observable<AlertaDTO.Listagem[]> {
    return this.httpClient.get<AlertaDTO.Listagem[]>(`${this.API}/ativos`);
  }

  buscarAlertasJaResolvidos(): Observable<AlertaDTO.Listagem[]> {
    return this.httpClient.get<AlertaDTO.Listagem[]>(`${this.API}/ja-resolvidos`);
  }

  buscarAlertasPersonalizados(): Observable<AlertaDTO.Listagem[]> {
    return this.httpClient.get<AlertaDTO.Listagem[]>(`${this.API}/personalizados`);
  }
}

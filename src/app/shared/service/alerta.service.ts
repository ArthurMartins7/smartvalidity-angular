import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AlertaDTO } from '../model/dto/alerta.dto';
import { AlertaSeletor } from '../model/seletor/alerta.seletor';

/**
 * URL base da API
 * Em produção, usar URL relativa: '/smartvalidity'
 * Em desenvolvimento, usar URL completa: 'http://localhost:8080/smartvalidity'
 */
const API_URL = 'http://localhost:8080/smartvalidity';

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly API = `${API_URL}/alertas`;

  constructor(private httpClient: HttpClient) {}

  listarTodos(): Observable<AlertaDTO.Listagem[]> {
    return this.httpClient.get<AlertaDTO.Listagem[]>(this.API).pipe(
      tap({
        next: (response) => console.log('Lista de alertas:', response),
        error: (error) => console.error('Erro ao listar alertas:', error)
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

  contarAlertas(seletor: AlertaSeletor): Observable<number> {
    return this.httpClient.post<{ total: number }>(`${this.API}/count`, seletor).pipe(
      tap({
        next: (response) => console.log('Total de alertas:', response.total),
        error: (error) => console.error('Erro ao contar alertas:', error)
      }),
      map(resp => resp.total)
    );
  }

  criarAlerta(novoAlerta: AlertaDTO.Cadastro, usuarioCriadorId?: string): Observable<AlertaDTO.Listagem> {
    const url = usuarioCriadorId ? `${this.API}?usuarioCriadorId=${usuarioCriadorId}` : this.API;
    console.log('Enviando alerta para criação:', novoAlerta);
    return this.httpClient.post<AlertaDTO.Listagem>(url, novoAlerta).pipe(
      tap({
        next: (response) => console.log('Alerta criado com sucesso:', response),
        error: (error) => console.error('Erro ao criar alerta:', error)
      })
    );
  }

  atualizarAlerta(id: number, alertaAtualizado: AlertaDTO.Edicao): Observable<AlertaDTO.Listagem> {
    console.log('Enviando alerta para atualização:', alertaAtualizado);
    return this.httpClient.put<AlertaDTO.Listagem>(`${this.API}/${id}`, alertaAtualizado).pipe(
      tap({
        next: (response) => console.log('Alerta atualizado com sucesso:', response),
        error: (error) => console.error('Erro ao atualizar alerta:', error)
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

  toggleAtivo(id: number): Observable<AlertaDTO.Listagem> {
    return this.httpClient.patch<AlertaDTO.Listagem>(`${this.API}/${id}/toggle-ativo`, {}).pipe(
      tap({
        next: (response) => console.log('Status do alerta alterado:', response),
        error: (error) => console.error('Erro ao alterar status do alerta:', error)
      })
    );
  }

  gerarAlertasAutomaticos(): Observable<any> {
    return this.httpClient.post<any>(`${this.API}/gerar-automaticos`, {}).pipe(
      tap({
        next: (response) => console.log('Alertas automáticos gerados:', response),
        error: (error) => console.error('Erro ao gerar alertas automáticos:', error)
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
}

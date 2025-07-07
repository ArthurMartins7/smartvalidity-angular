import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { MuralFiltroDTO } from '../model/dto/mural.dto';

/**
 * URL base da API
 * Em produção, usar URL relativa: '/smartvalidity'
 * Em desenvolvimento, usar URL completa: 'http://localhost:8080/smartvalidity'
 */
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${API_URL}/mural`;
  }

  /**
   * Gera relatório Excel do mural
   * @param tipo Tipo do relatório (SELECIONADOS, PAGINA, TODOS)
   * @param ids IDs dos itens selecionados (apenas para tipo SELECIONADOS)
   * @param filtro Filtros aplicados
   * @param status Status atual (proximo, hoje, vencido)
   * @returns Observable do arquivo Excel
   */
  gerarRelatorioMural(
    tipo: 'SELECIONADOS' | 'PAGINA' | 'TODOS',
    ids: string[] | null = null,
    filtro: MuralFiltroDTO | null = null,
    status: string | null = null
  ): Observable<HttpResponse<Blob>> {
    const request = {
      tipo,
      ids,
      filtro,
      status
    };

    return this.http.post(`${this.apiUrl}/relatorio`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /**
   * Faz o download do arquivo Excel
   * @param response Resposta HTTP contendo o arquivo
   * @param nomeArquivo Nome do arquivo para download
   */
  downloadArquivo(response: HttpResponse<Blob>, nomeArquivo: string = 'relatorio-mural.xlsx'): void {
    const blob = response.body;
    if (!blob) {
      console.error('Arquivo não encontrado na resposta');
      return;
    }

    // Criar URL do blob
    const url = window.URL.createObjectURL(blob);

    // Criar link temporário e simular clique
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();

    // Limpar URL
    window.URL.revokeObjectURL(url);
  }
}

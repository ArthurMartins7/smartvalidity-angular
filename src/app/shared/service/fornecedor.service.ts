import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { Corredor } from '../model/entity/corredor';
import { Fornecedor } from '../model/entity/fornecedor';
import { FornecedorSeletor } from '../model/seletor/fornecedor.seletor';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private readonly API = `${environment.apiUrl}/fornecedor`;

  constructor(private httpClient: HttpClient) { }

  criarFornecedor(novoFornecedor: Fornecedor): Observable<Fornecedor> {
    return this.httpClient.post<Fornecedor>(this.API, novoFornecedor);
  }

  listarTodos(): Observable<Fornecedor[]> {
    return this.httpClient.get<Fornecedor[]>(this.API);
  }

  buscarPorId(id: string): Observable<Fornecedor> {
    return this.httpClient.get<Fornecedor>(`${this.API}/${id}`);
  }

  listarComSeletor(seletor: FornecedorSeletor): Observable<Fornecedor[]> {
    return this.httpClient.post<Fornecedor[]>(`${this.API}/filtro`, seletor);
  }

  contarPaginas(seletor: FornecedorSeletor): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/total-paginas`, seletor);
  }

  contarTotalRegistros(seletor: FornecedorSeletor): Observable<number> {
    return this.httpClient.post<number>(this.API + '/contar', seletor);
  }

  atualizarFornecedor(id: string, fornecedorAtualizado: Fornecedor): Observable<Fornecedor> {
    return this.httpClient.put<Fornecedor>(`${this.API}/${id}`, fornecedorAtualizado);
  }

  excluirFornecedor(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }

  buscarCorredoresPorFornecedor(fornecedorId: string): Observable<Corredor[]> {
    return this.httpClient.get<Corredor[]>(`${this.API}/${fornecedorId}/corredores`);
  }
}

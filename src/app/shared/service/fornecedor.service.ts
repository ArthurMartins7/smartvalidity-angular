import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fornecedor } from '../model/entity/fornecedor';
import { FornecedorSeletor } from '../model/seletor/fornecedor.seletor';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private readonly API = 'http://localhost:8080/smartvalidity/fornecedor';

  constructor(private httpClient: HttpClient) { }

  criarFornecedor(novoFornecedor: Fornecedor): Observable<Fornecedor> {
    return this.httpClient.post<Fornecedor>(this.API, novoFornecedor);
  }

  listarTodos(): Observable<Fornecedor[]> {
    return this.httpClient.get<Fornecedor[]>(this.API);
  }

  buscarPorId(id: number): Observable<Fornecedor> {
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

  atualizarFornecedor(id: number, fornecedorAtualizado: Fornecedor): Observable<Fornecedor> {
    return this.httpClient.put<Fornecedor>(`${this.API}/${id}`, fornecedorAtualizado);
  }

  excluirFornecedor(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Produto } from '../model/entity/produto';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly API = 'http://localhost:8080/smartvalidity/produto';

  constructor(private httpClient: HttpClient) {}

  listarTodos(): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(this.API);
  }

  listarPorCategoria(categoriaId: number): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.API}/categoria/${categoriaId}`);
  }

  buscarPorId(id: number): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.API}/${id}`);
  }

  criarProduto(novoProduto: Produto): Observable<Produto> {
    return this.httpClient.post<Produto>(this.API, novoProduto);
  }

  atualizarProduto(id: number, produtoAtualizado: Produto): Observable<Produto> {
    return this.httpClient.put<Produto>(`${this.API}/${id}`, produtoAtualizado);
  }

  excluirProduto(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

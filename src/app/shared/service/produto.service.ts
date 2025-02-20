import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProdutoDTO } from '../model/dto/produto.dto';
import { ProdutoSeletor } from '../model/seletor/produto.seletor';
// import { Page } from '../model/page';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly API = 'http://localhost:8080/smartvalidity/produto';

  constructor(private httpClient: HttpClient) {}

  listarTodos(): Observable<ProdutoDTO[]> {
    return this.httpClient.get<ProdutoDTO[]>(this.API);
  }

  buscarPorId(id: number): Observable<ProdutoDTO> {
    return this.httpClient.get<ProdutoDTO>(`${this.API}/${id}`);
  }

  criarProduto(novoProduto: ProdutoDTO): Observable<ProdutoDTO> {
    return this.httpClient.post<ProdutoDTO>(this.API, novoProduto);
  }

  atualizarProduto(id: number, produtoAtualizado: ProdutoDTO): Observable<ProdutoDTO> {
    return this.httpClient.put<ProdutoDTO>(`${this.API}/${id}`, produtoAtualizado);
  }

  excluirProduto(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

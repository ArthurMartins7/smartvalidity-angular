import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ItemProdutoDTO } from '../model/dto/item-Produto.dto';
// import { Page } from '../model/page';

@Injectable({
  providedIn: 'root',
})
export class ItemProdutoService {
  private readonly API = `${environment.apiUrl}/item-produto`;

  constructor(private httpClient: HttpClient) {}

  listarTodos(): Observable<ItemProdutoDTO[]> {
    return this.httpClient.get<ItemProdutoDTO[]>(this.API);
  }

  buscarPorId(id: string): Observable<ItemProdutoDTO> {
    return this.httpClient.get<ItemProdutoDTO>(`${this.API}/${id}`);
  }

  buscarPorProduto(produtoId: string): Observable<ItemProdutoDTO[]> {
    return this.httpClient.get<ItemProdutoDTO[]>(`${this.API}/produto/${produtoId}`);
  }

  /**
   * Busca itens-produto não inspecionados de um produto específico
   * Para uso em alertas personalizados
   */
  buscarItensProdutoNaoInspecionadosPorProduto(produtoId: string): Observable<ItemProdutoDTO[]> {
    return this.httpClient.get<ItemProdutoDTO[]>(`${this.API}/produto/${produtoId}/nao-inspecionados`);
  }

  criarItemProduto(novoItemProduto: ItemProdutoDTO): Observable<ItemProdutoDTO> {
    return this.httpClient.post<ItemProdutoDTO>(this.API, novoItemProduto);
  }

  atualizarItemProduto(id: string, itemProdutoAtualizado: ItemProdutoDTO): Observable<ItemProdutoDTO> {
    return this.httpClient.put<ItemProdutoDTO>(`${this.API}/${id}`, itemProdutoAtualizado);
  }

  excluirItemProduto(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemProdutoDTO } from '../model/dto/item-Produto.dto'
import { ItemProdutoSeletor } from '../model/seletor/item-produto.seletor';
// import { Page } from '../model/page';

@Injectable({
  providedIn: 'root',
})
export class ItemProdutoService {
  private readonly API = 'http://localhost:8080/smartvalidity/item-produto';

  constructor(private httpClient: HttpClient) {}

  listarTodos(): Observable<ItemProdutoDTO[]> {
    return this.httpClient.get<ItemProdutoDTO[]>(this.API);
  }

  buscarPorId(id: number): Observable<ItemProdutoDTO> {
    return this.httpClient.get<ItemProdutoDTO>(`${this.API}/${id}`);
  }

  buscarPorProduto(produtoId: number): Observable<ItemProdutoDTO[]> {
    return this.httpClient.get<ItemProdutoDTO[]>(`${this.API}/produto/${produtoId}`);
  }

  criarItemProduto(novoItemProduto: ItemProdutoDTO): Observable<ItemProdutoDTO> {
    return this.httpClient.post<ItemProdutoDTO>(this.API, novoItemProduto);
  }

  atualizarItemProduto(id: number, itemProdutoAtualizado: ItemProdutoDTO): Observable<ItemProdutoDTO> {
    return this.httpClient.put<ItemProdutoDTO>(`${this.API}/${id}`, itemProdutoAtualizado);
  }

  excluirItemProduto(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

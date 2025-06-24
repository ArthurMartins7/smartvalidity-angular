import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Produto } from '../model/entity/produto';
import { ProdutoSeletor } from '../model/seletor/produto.seletor';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly API = 'http://localhost:8080/smartvalidity/produto';

  constructor(private httpClient: HttpClient) {}

  listarTodos(): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(this.API).pipe(
      tap({
        next: (response) => console.log('Lista de produtos:', response),
        error: (error) => console.error('Erro ao listar produtos:', error)
      })
    );
  }

  /**
   * Lista apenas produtos que possuem itens-produto não inspecionados
   * Para uso em alertas personalizados
   */
  listarProdutosComItensNaoInspecionados(): Observable<Produto[]> {
    return this.httpClient.get<Produto[]>(`${this.API}/com-itens-nao-inspecionados`).pipe(
      tap({
        next: (response) => console.log('Produtos com itens não inspecionados:', response),
        error: (error) => console.error('Erro ao listar produtos com itens não inspecionados:', error)
      })
    );
  }

  listarPorCategoria(categoriaId: string): Observable<Produto[]> {
    const categoriaIdString = categoriaId.toString();
    console.log('Making API request to:', `${this.API}/categoria/${categoriaIdString}`);
    return this.httpClient.get<Produto[]>(`${this.API}/categoria/${categoriaIdString}`).pipe(
      tap({
        next: (response) => console.log('API response:', response),
        error: (error) => console.error('API error:', error)
      })
    );
  }

  buscarPorId(id: string): Observable<Produto> {
    return this.httpClient.get<Produto>(`${this.API}/${id}`).pipe(
      tap({
        next: (response) => console.log('Produto encontrado:', response),
        error: (error) => console.error('Erro ao buscar produto:', error)
      })
    );
  }

    listarComSeletor(seletor: ProdutoSeletor): Observable<Produto[]> {
      return this.httpClient.post<Produto[]>(`${this.API}/filtro`, seletor);
    }

    contarPaginas(seletor: ProdutoSeletor): Observable<number> {
      return this.httpClient.post<number>(`${this.API}/total-paginas`, seletor);
    }

    contarTotalRegistros(seletor: ProdutoSeletor): Observable<number> {
      return this.httpClient.post<number>(this.API + '/contar', seletor);
    }


  criarProduto(novoProduto: Produto): Observable<Produto> {
    console.log('Enviando produto para criação:', novoProduto);
    return this.httpClient.post<Produto>(this.API, novoProduto).pipe(
      tap({
        next: (response) => console.log('Produto criado com sucesso:', response),
        error: (error) => console.error('Erro ao criar produto:', error)
      })
    );
  }

  atualizarProduto(id: string, produtoAtualizado: Produto): Observable<Produto> {
    console.log('Enviando produto para atualização:', produtoAtualizado);
    return this.httpClient.put<Produto>(`${this.API}/${id}`, produtoAtualizado).pipe(
      tap({
        next: (response) => console.log('Produto atualizado com sucesso:', response),
        error: (error) => console.error('Erro ao atualizar produto:', error)
      })
    );
  }

  excluirProduto(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`).pipe(
      tap({
        next: () => console.log('Produto excluído com sucesso'),
        error: (error) => console.error('Erro ao excluir produto:', error)
      })
    );
  }
}

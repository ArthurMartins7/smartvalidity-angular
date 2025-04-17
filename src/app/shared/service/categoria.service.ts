import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../model/entity/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly API = 'http://localhost:8080/smartvalidity/categoria';

  constructor(private httpClient: HttpClient) {}

  // listarComFiltros(seletor: CategoriaSeletor): Observable<Page<CategoriaDTO>> {
  listarTodas(): Observable<Categoria[]> {
    return this.httpClient.get<Categoria[]>(this.API);
  }

  buscarPorId(id: string): Observable<Categoria> {
    return this.httpClient.get<Categoria>(`${this.API}/${id}`);
  }

  criarCategoria(novaCategoria: Categoria): Observable<Categoria> {
    return this.httpClient.post<Categoria>(this.API, novaCategoria);
  }

  atualizarCategoria(id: string, categoriaAtualizada: Categoria): Observable<Categoria> {
    return this.httpClient.put<Categoria>(`${this.API}/${id}`, categoriaAtualizada);
  }

  excluirCategoria(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

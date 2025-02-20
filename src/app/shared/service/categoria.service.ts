import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaDTO } from '../model/dto/categoria.dto';
import { CategoriaSeletor } from '../model/seletor/categoria.seletor';
// import { Page } from '../model/page';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly API = 'http://localhost:8080/smartvalidity/categoria';

  constructor(private httpClient: HttpClient) {}

  // listarComFiltros(seletor: CategoriaSeletor): Observable<Page<CategoriaDTO>> {
  listarTodas(): Observable<CategoriaDTO[]> {
    return this.httpClient.get<CategoriaDTO[]>(this.API);
  }

  buscarPorId(id: number): Observable<CategoriaDTO> {
    return this.httpClient.get<CategoriaDTO>(`${this.API}/${id}`);
  }

  criarCategoria(novaCategoria: CategoriaDTO): Observable<CategoriaDTO> {
    return this.httpClient.post<CategoriaDTO>(this.API, novaCategoria);
  }

  atualizarCategoria(id: number, categoriaAtualizada: CategoriaDTO): Observable<CategoriaDTO> {
    return this.httpClient.put<CategoriaDTO>(`${this.API}/${id}`, categoriaAtualizada);
  }

  excluirCategoria(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

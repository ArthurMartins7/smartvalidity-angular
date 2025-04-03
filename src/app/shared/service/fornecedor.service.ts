import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FornecedorDTO } from '../model/dto/fornecedor.dto';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  private readonly API = 'http://localhost:8080/smartvalidity/fornecedor';

  constructor(private httpClient: HttpClient) { }

  criarFornecedor(novoFornecedor: FornecedorDTO): Observable<FornecedorDTO> {
    return this.httpClient.post<FornecedorDTO>(this.API, novoFornecedor);
  }

  listarTodos(): Observable<FornecedorDTO[]> {
    return this.httpClient.get<FornecedorDTO[]>(this.API);
  }

  buscarPorId(id: number): Observable<FornecedorDTO> {
    return this.httpClient.get<FornecedorDTO>(`${this.API}/${id}`);
  }

  atualizarFornecedor(id: number, fornecedorAtualizado: FornecedorDTO): Observable<FornecedorDTO> {
    return this.httpClient.put<FornecedorDTO>(`${this.API}/${id}`, fornecedorAtualizado);
  }

  excluirFornecedor(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

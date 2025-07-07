import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { EnderecoDTO } from '../model/dto/endereco.dto';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private readonly API = `${environment.apiUrl}/endereco`;

  constructor(private httpClient: HttpClient) { }

  criarEndereco(novoEndereco: EnderecoDTO): Observable<EnderecoDTO> {
    return this.httpClient.post<EnderecoDTO>(this.API, novoEndereco);
  }

  listarTodos(): Observable<EnderecoDTO[]> {
    return this.httpClient.get<EnderecoDTO[]>(this.API);
  }

  buscarPorId(id: number): Observable<EnderecoDTO> {
    return this.httpClient.get<EnderecoDTO>(`${this.API}/${id}`);
  }

  atualizarEndereco(id: number, enderecoAtualizado: EnderecoDTO): Observable<EnderecoDTO> {
    return this.httpClient.put<EnderecoDTO>(`${this.API}/${id}`, enderecoAtualizado);
  }

  excluirEndereco(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

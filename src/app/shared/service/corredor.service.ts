import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorredorDTO } from '../model/dto/corredor.dto';
import { Corredor } from '../model/entity/corredor';

@Injectable({
  providedIn: 'root'
})
export class CorredorService {
  private readonly API = 'http://localhost:8080/smartvalidity/corredor';

  constructor(private httpClient: HttpClient) { }

  criarCorredor(novoCorredor: CorredorDTO): Observable<CorredorDTO> {
    return this.httpClient.post<CorredorDTO>(this.API, novoCorredor);
  }

  listarTodos(): Observable<Array<Corredor>> {
    return this.httpClient.get<Array<Corredor>>(this.API);
  }

  buscarPorId(id: number): Observable<CorredorDTO> {
    return this.httpClient.get<CorredorDTO>(`${this.API}/${id}`);
  }

  atualizarCorredor(id: number, corredorAtualizado: CorredorDTO): Observable<CorredorDTO> {
    return this.httpClient.put<CorredorDTO>(`${this.API}/${id}`, corredorAtualizado);
  }

  excluirCorredor(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

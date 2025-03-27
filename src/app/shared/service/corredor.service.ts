import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Corredor } from '../model/entity/corredor';

@Injectable({
  providedIn: 'root'
})
export class CorredorService {
  private readonly API = 'http://localhost:8080/smartvalidity/corredor';

  constructor(private httpClient: HttpClient) { }

  criarCorredor(novoCorredor: Corredor): Observable<Corredor> {
    return this.httpClient.post<Corredor>(this.API, novoCorredor);
  }
  listarTodos(): Observable<Array<Corredor>> {
    return this.httpClient.get<Array<Corredor>>(this.API);
  }

  buscarPorId(id: number): Observable<Corredor> {
    return this.httpClient.get<Corredor>(`${this.API}/${id}`);
  }

  atualizarCorredor(id: number, corredorAtualizado: Corredor): Observable<Corredor> {
    return this.httpClient.put<Corredor>(`${this.API}/${id}`, corredorAtualizado);
  }

  excluirCorredor(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

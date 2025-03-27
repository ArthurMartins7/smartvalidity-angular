import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../model/entity/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly API = 'http://localhost:8080/smartvalidity/usuario';

  constructor(private httpClient: HttpClient) { }

  buscarTodos(): Observable<Array<Usuario>> {
      return this.httpClient.get<Array<Usuario>>(this.API);
    }
}

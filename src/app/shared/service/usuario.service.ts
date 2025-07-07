import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioConviteDTO } from '../model/dto/usuario-convite.dto';
import { Usuario } from '../model/entity/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly API = 'http://localhost:8080/smartvalidity/usuario';

  constructor(private httpClient: HttpClient) {

  }

  buscarTodos(): Observable<Array<Usuario>> {
      return this.httpClient.get<Array<Usuario>>(this.API);
    }

  /**
   * Convida um novo usuário. O backend enviará uma senha provisória por e-mail.
   */
  convidar(dto: UsuarioConviteDTO): Observable<Usuario> {
    return this.httpClient.post<Usuario>(`${this.API}/convidar`, dto);
  }

  /** Lista usuários pendentes de aceitação */
  listarPendentes(): Observable<Array<Usuario>> {
    return this.httpClient.get<Array<Usuario>>(`${this.API}/pendentes`);
  }

  /** Lista usuários ativos */
  listarAtivos(): Observable<Array<Usuario>> {
    return this.httpClient.get<Array<Usuario>>(`${this.API}/ativos`);
  }

  /** Exclui usuário pelo id */
  excluir(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }

  buscarPorId(id: string): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.API}/${id}`);
  }

  alterar(id: string, usuario: Usuario): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.API}/${id}`, usuario);
  }

  /** Reenvia convite para usuário pendente */
  reenviarConvite(id: string): Observable<void> {
    return this.httpClient.post<void>(`${this.API}/${id}/reenviar-convite`, {});
  }
}

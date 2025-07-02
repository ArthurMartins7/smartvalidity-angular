import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { UsuarioDTO } from '../../model/dto/UsuarioDTO';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { EmpresaUsuarioDto } from '../../../shared/model/dto/empresaUsuario.dto';
import { Empresa } from '../../../shared/model/entity/empresa';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly API = 'http://localhost:8080/smartvalidity/auth';

  constructor(private httpClient: HttpClient) {}

  authenticate(dto: Partial<Usuario>): Observable<HttpResponse<string>> {
    const authHeader = 'Basic ' + btoa(`${dto.email}:${dto.senha}`);
    const headers = new HttpHeaders({
      Authorization: authHeader,
    });

    return this.httpClient.post<string>(this.API + '/authenticate', dto, {
      headers,
      observe: 'response',
      responseType: 'text' as 'json',
    });
  }

  public register(usuario: Usuario): Observable<any> {
    return this.httpClient.post<Usuario>(this.API + '/novo-usuario', usuario);
  }

  public getCurrentUser(): Observable<Usuario> {
    return this.httpClient.get<Usuario>(this.API + '/current-user');
  }

  logout() {
    localStorage.removeItem('tokenUsuarioAutenticado');
    sessionStorage.removeItem('usuarioEmail');
    sessionStorage.removeItem('usuarioNome');
  }

  public verificarAssinaturaExistente(): Observable<boolean> {
    return this.httpClient.get<boolean>(this.API + '/verificar-assinatura');
  }

  public registrarEmpresa(dto: EmpresaUsuarioDto): Observable<Empresa> {
    return this.httpClient.post<Empresa>(this.API + '/registrar-empresa', dto);
  }
}

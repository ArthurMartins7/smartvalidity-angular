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

  /**
   * Solicita o envio de um código OTP para o e-mail informado.
   * O backend responde 204 (No Content) em caso de sucesso.
   * @param email e-mail do usuário que receberá o código
   */
  public enviarOtpEmail(email: string): Observable<void> {
    const payload = { email };
    return this.httpClient.post<void>(this.API + '/enviar-otp-email', payload);
  }

  /* Passo 1 – Solicitar OTP de recuperação (Esqueceu Senha) */
  public solicitarOtpRecuperacao(email: string): Observable<void> {
    return this.httpClient.post<void>(this.API + '/enviar-otp-esqueceu-senha', { email });
  }

  /* Passo 2 – Validar OTP recebido */
  public validarOtpRecuperacao(email: string, token: string): Observable<void> {
    return this.httpClient.post<void>(this.API + '/validar-otp-esqueceu-senha', { email, token });
  }

  /* Passo 3 – Redefinir senha */
  public redefinirSenha(email: string, token: string, novaSenha: string): Observable<void> {
    return this.httpClient.post<void>(this.API + '/resetar-senha', { email, token, novaSenha });
  }
}

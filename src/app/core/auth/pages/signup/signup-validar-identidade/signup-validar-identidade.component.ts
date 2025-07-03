import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { EmpresaUsuarioDto } from '../../../../../shared/model/dto/empresaUsuario.dto';
import { AuthenticationService } from '../../../services/auth.service';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";

@Component({
  selector: 'app-signup-validar-identidade',
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './signup-validar-identidade.component.html',
  styleUrl: './signup-validar-identidade.component.css'
})
export class SignupValidarIdentidadeComponent {

  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  /**
   * Flags dos checkboxes exibidos no formulário
   */
  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  // Código de verificação digitado pelo usuário
  public codigo: string = '';

  // E-mail destino para exibição na mensagem
  public emailDestino: string = '';

  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  constructor() {
    // Tenta recuperar o e-mail salvo na etapa 1
    const usuarioJson = sessionStorage.getItem('signup_usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.emailDestino = usuario.email || '';
      } catch (_) {}
    }
  }

  /**
   * Finaliza criação da conta após validar código
   */
  public criarConta(): void {
    if (this.codigo.length !== 6) {
      alert('Informe o código de 6 dígitos.');
      return;
    }

    // Montar DTO a partir dos dados salvos nas etapas anteriores
    const usuarioJson = sessionStorage.getItem('signup_usuario');
    const empresaJson = sessionStorage.getItem('signup_empresa');
    const senha = sessionStorage.getItem('signup_senha');

    if (!usuarioJson || !empresaJson || !senha) {
      alert('Dados de cadastro incompletos. Por favor, refaça o cadastro.');
      this.router.navigate(['signup-info-pessoais']);
      return;
    }

    const usuarioObj: Usuario = JSON.parse(usuarioJson);
    const empresaObj: Empresa = JSON.parse(empresaJson);

    const dto: EmpresaUsuarioDto = {
      cnpj: empresaObj.cnpj,
      razaoSocial: empresaObj.razaoSocial,
      nomeUsuario: usuarioObj.nome,
      email: usuarioObj.email,
      senha: senha,
      cargo: usuarioObj.cargo,
      token: this.codigo
    } as EmpresaUsuarioDto;

    // Chamar backend para registrar empresa e usuário assinante
    this.authenticationService.registrarEmpresa(dto).subscribe({
      next: (_) => {
        alert('Conta criada com sucesso!');
        // Limpar dados temporários de cadastro
        sessionStorage.removeItem('signup_usuario');
        sessionStorage.removeItem('signup_empresa');
        sessionStorage.removeItem('signup_senha');
        this.router.navigate(['']);
      },
      error: (erro) => {
        console.error('Erro ao criar conta:', erro);
        const mensagem = erro?.error || 'Código inválido ou expirado';
        alert(mensagem);
      }
    });
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['signup-senha']);
  }

  // Reenvia o código para o e-mail do usuário
  public reenviarCodigo(): void {
    if (!this.emailDestino) {
      alert('E-mail não informado.');
      return;
    }

    this.authenticationService.enviarOtpEmail(this.emailDestino).subscribe({
      next: () => alert('Código enviado'),
      error: (err) => {
        const mensagem = err?.error || 'Não foi possível enviar o código.';
        alert(mensagem);
      }
    });
  }

}

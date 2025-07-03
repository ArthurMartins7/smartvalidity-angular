import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { AuthenticationService } from '../../../services/auth.service';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";


@Component({
  selector: 'app-signup-verificacao',
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './signup-verificacao.component.html',
  styleUrl: './signup-verificacao.component.css'
})
export class SignupVerificacaoComponent {

  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  /**
   * Flags dos checkboxes exibidos no formulário
   */
  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  // Campos de senha da etapa 2
  public senha: string = '';
  public confirmarSenha: string = '';

  // Flags de visibilidade dos campos de senha
  public showSenha: boolean = false;
  public showConfirmarSenha: boolean = false;

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
   * Avança para a próxima etapa do cadastro.
   * Por enquanto apenas persiste as informações no sessionStorage
   * e redireciona para a etapa de criação de senha.
   */
  public avancar(): void {

    if (this.senha !== this.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    // Persistir a senha (exemplo) e navegar para verificação
    sessionStorage.setItem('signup_senha', this.senha);

    this.router.navigate(['signup-validar-identidade']);
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['signup-senha']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }

  /**
   * Solicita o envio do código de verificação para o e-mail informado
   * e navega para a próxima etapa em caso de sucesso.
   */
  public receberCodigo(): void {
    if (!this.emailDestino) {
      alert('E-mail não informado. Volte e preencha os dados novamente.');
      return;
    }

    this.authenticationService.enviarOtpEmail(this.emailDestino).subscribe({
      next: () => {
        alert('Código enviado');
        // Persistir a senha (caso ainda não esteja) e navegar para validar identidade
        if (this.senha && !sessionStorage.getItem('signup_senha')) {
          sessionStorage.setItem('signup_senha', this.senha);
        }
        this.router.navigate(['signup-validar-identidade']);
      },
      error: (err) => {
        // Backend pode retornar mensagem de e-mail já cadastrado ou outra 4xx
        const mensagem = err?.error || 'Não foi possível enviar o código. Verifique os dados e tente novamente.';
        alert(mensagem);
      }
    });
  }

}

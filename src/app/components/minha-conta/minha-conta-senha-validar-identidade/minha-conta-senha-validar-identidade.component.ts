import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { Empresa } from '../../../shared/model/entity/empresa';
import { HeaderAuthComponent } from '../../../shared/ui/headers/header-auth/header-auth.component';

@Component({
  selector: 'app-minha-conta-senha-validar-identidade',
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './minha-conta-senha-validar-identidade.component.html',
  styleUrl: './minha-conta-senha-validar-identidade.component.css'
})
export class MinhaContaSenhaValidarIdentidadeComponent {

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

    this.router.navigate(['signup-verificacao']);
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

  // Envia código de verificação e navega para próxima etapa
  public receberCodigo(): void {
    // Aqui poderia chamar serviço para enviar e-mail
    alert('Código enviado para ' + this.emailDestino);

    this.router.navigate(['minha-conta-senha-codigo-verificacao']);
  }

}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { CommonModule } from '@angular/common';
import { HeaderPasswordRecoveryComponent } from '../../../../../shared/ui/headers/header-password-recovery/header-password-recovery.component';

@Component({
  selector: 'app-password-recovery-alterar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderPasswordRecoveryComponent],
  templateUrl: './password-recovery-alterar-senha.component.html',
  styleUrl: './password-recovery-alterar-senha.component.css'
})
export class PasswordRecoveryAlterarSenhaComponent {

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

  private router = inject(Router);

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
    this.router.navigate(['']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }

}

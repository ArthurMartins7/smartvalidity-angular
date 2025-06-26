import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { CommonModule } from '@angular/common';
import { HeaderPasswordRecoveryComponent } from '../../../../../shared/ui/headers/header-password-recovery/header-password-recovery.component';

@Component({
  selector: 'app-password-recovery-codigo-verificacao',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderPasswordRecoveryComponent],
  templateUrl: './password-recovery-codigo-verificacao.component.html',
  styleUrl: './password-recovery-codigo-verificacao.component.css'
})
export class PasswordRecoveryCodigoVerificacaoComponent {

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

    // Aqui você validaria o código com o backend.
    alert('Conta criada com sucesso!');

    this.router.navigate(['password-recovery-alterar-senha']);
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['signup-senha']);
  }

  // Reenvia o código para o e-mail do usuário
  public reenviarCodigo(): void {
    alert('Novo código enviado para ' + this.emailDestino);
  }

}

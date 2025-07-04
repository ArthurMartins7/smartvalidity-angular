import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { CommonModule } from '@angular/common';
import { HeaderPasswordRecoveryComponent } from '../../../../../shared/ui/headers/header-password-recovery/header-password-recovery.component';
import { AuthenticationService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

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
  private authenticationService = inject(AuthenticationService);

  constructor() {
    // Tenta recuperar o e-mail salvo na etapa 1
    const email = sessionStorage.getItem('password_recovery_email');
    if (email) {
      this.emailDestino = email;
    }
  }

  /**
   * Finaliza criação da conta após validar código
   */
  public confirmarCodigo(): void {
    if (this.codigo.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Informe o código de 6 dígitos.',
        confirmButtonColor: '#5084C1'
      });
      return;
    }

    this.authenticationService.validarOtpRecuperacao(this.emailDestino, this.codigo).subscribe({
      next: () => {
        sessionStorage.setItem('password_recovery_token', this.codigo);
        this.router.navigate(['password-recovery-alterar-senha']);
      },
      error: (err) => {
        console.log('erro', err);
        const mensagem = err?.error?.message || 'Código inválido ou expirado';
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: mensagem,
          confirmButtonColor: '#5084C1'
        });
      }
    });
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['password-recovery-validar-identidade']);
  }

  // Reenvia o código para o e-mail do usuário
  public reenviarCodigo(): void {
    this.authenticationService.solicitarOtpRecuperacao(this.emailDestino).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Código enviado', confirmButtonColor: '#5084C1' }),
      error: (err) => {
        const mensagem = err?.error || 'Não foi possível enviar o código.';
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem, confirmButtonColor: '#5084C1' });
      }
    });
  }

}

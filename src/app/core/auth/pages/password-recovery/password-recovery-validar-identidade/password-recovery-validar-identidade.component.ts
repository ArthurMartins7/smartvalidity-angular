import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderPasswordRecoveryComponent } from '../../../../../shared/ui/headers/header-password-recovery/header-password-recovery.component';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password-recovery-validar-identidade',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderPasswordRecoveryComponent],
  templateUrl: './password-recovery-validar-identidade.component.html',
  styleUrl: './password-recovery-validar-identidade.component.css'
})
export class PasswordRecoveryValidarIdentidadeComponent {

  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  public email: string = '';

  public voltar(): void {
    this.router.navigate(['']);
  }

  public confirrmarEmail(): void {
    if (!this.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Informe o e-mail.',
        confirmButtonColor: '#5084C1'
      });
      return;
    }

    this.authenticationService.solicitarOtpRecuperacao(this.email).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Código enviado',
          confirmButtonColor: '#5084C1'
        });
        sessionStorage.setItem('password_recovery_email', this.email);
        this.router.navigate(['/password-recovery-codigo-verificacao']);
      },
      error: (err) => {
        console.log('err: ', err);
        const mensagem = err?.error.message || 'Não foi possível enviar o código.';
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: mensagem,
          confirmButtonColor: '#5084C1'
        });
      }
    });
  }

}

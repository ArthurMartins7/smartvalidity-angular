import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HeaderPasswordRecoveryComponent } from '../../../../../shared/ui/headers/header-password-recovery/header-password-recovery.component';
import { AuthenticationService } from '../../../services/auth.service';

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
  isLoading = false;

  public voltar(): void {
    this.router.navigate(['']);
  }

  public confirrmarEmail(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    this.isLoading = true;
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
        this.isLoading = false;
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
        this.isLoading = false;
      }
    });
  }

}

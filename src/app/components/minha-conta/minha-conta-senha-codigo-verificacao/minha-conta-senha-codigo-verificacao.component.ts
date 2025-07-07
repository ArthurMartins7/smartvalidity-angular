import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../../core/auth/services/auth.service';
import { HeaderAuthComponent } from '../../../shared/ui/headers/header-auth/header-auth.component';

@Component({
  selector: 'app-minha-conta-senha-codigo-verificacao',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAuthComponent],
  templateUrl: './minha-conta-senha-codigo-verificacao.component.html',
  styleUrl: './minha-conta-senha-codigo-verificacao.component.css'
})
export class MinhaContaSenhaCodigoVerificacaoComponent {

  // Código de verificação digitado pelo usuário
  public codigo: string = '';

  // E-mail destino para exibição na mensagem
  public emailDestino: string = '';

  private router = inject(Router);
  private authService = inject(AuthenticationService);

  isResending = false;

  constructor() {
    // Recupera o e-mail salvo na etapa anterior
    const email = sessionStorage.getItem('usuarioEmail');
    if (email) this.emailDestino = email;
  }

  /**
   * Finaliza criação da conta após validar código
   */
  public confirmarCodigo(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    this.authService.validarOtpAlterarSenha(this.emailDestino, this.codigo).subscribe({
      next: () => {
        sessionStorage.setItem('alterar_senha_token', this.codigo);
        this.router.navigate(['minha-conta-senha-alterar']);
      },
      error: (err) => {
        const msg = err?.error || 'Código inválido ou expirado';
        Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#5084C1' });
      }
    });
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['minha-conta-senha-validar-identidade']);
  }

  // Reenvia o código para o e-mail do usuário
  public reenviarCodigo(): void {
    if (!this.emailDestino) return;
    this.isResending = true;
    this.authService.enviarOtpAlterarSenha(this.emailDestino).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Código enviado', confirmButtonColor: '#5084C1' }),
      error: (_) => Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível enviar o código.', confirmButtonColor: '#5084C1' }),
      complete: () => { this.isResending = false; }
    });
  }

  public onCodigoInput(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    this.codigo = digits;
    input.value = digits;
    if (digits.length < 6) {
      input.setCustomValidity('Informe 6 dígitos.');
    } else {
      input.setCustomValidity('');
    }
  }

}

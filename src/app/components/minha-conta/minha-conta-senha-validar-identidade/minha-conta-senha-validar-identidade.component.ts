import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../../core/auth/services/auth.service';
import { HeaderAuthComponent } from '../../../shared/ui/headers/header-auth/header-auth.component';

@Component({
  selector: 'app-minha-conta-senha-validar-identidade',
  standalone: true,
  imports: [CommonModule, HeaderAuthComponent],
  templateUrl: './minha-conta-senha-validar-identidade.component.html',
  styleUrl: './minha-conta-senha-validar-identidade.component.css'
})
export class MinhaContaSenhaValidarIdentidadeComponent {

  // E-mail destino para exibição na mensagem
  public emailDestino: string = '';

  private router = inject(Router);
  private authService = inject(AuthenticationService);

  isSending = false;

  constructor() {
    // Tenta recuperar o e-mail salvo na etapa 1
    const sessionEmail = sessionStorage.getItem('usuarioEmail');
    if (sessionEmail) this.emailDestino = sessionEmail;
    const usuarioJson = sessionStorage.getItem('signup_usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.emailDestino = usuario.email || '';
      } catch (_) {}
    }
  }

  // Envia código de verificação e navega para próxima etapa
  public receberCodigo(): void {
    if (!this.emailDestino) { return; }
    this.isSending = true;
    this.authService.enviarOtpAlterarSenha(this.emailDestino).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Código enviado', confirmButtonColor: '#5084C1' });
        this.router.navigate(['minha-conta-senha-codigo-verificacao']);
        this.isSending = false;
      },
      error: (err) => {
        const msg = err?.error || 'Erro ao enviar código';
        Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#5084C1' });
        this.isSending = false;
      }
    });
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['minha-conta-info']);
  }

}

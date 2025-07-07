import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-minha-conta-senha-alterar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './minha-conta-senha-alterar.component.html',
  styleUrl: './minha-conta-senha-alterar.component.css'
})
export class MinhaContaSenhaAlterarComponent {

  // Senha antiga removida

  // Campos de senha nova
  public senha: string = '';
  public confirmarSenha: string = '';

  // Flags de visibilidade dos campos de senha
  public showSenha: boolean = false;
  public showConfirmarSenha: boolean = false;

  private router = inject(Router);
  private authService = inject(AuthenticationService);

  /**
   * Avança para a próxima etapa do cadastro.
   * Por enquanto apenas persiste as informações no sessionStorage
   * e redireciona para a etapa de criação de senha.
   */
  public alterarSenha(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      Swal.fire({ icon: 'warning', title: 'As senhas não coincidem.', confirmButtonColor: '#5084C1' });
      return;
    }

    const email = sessionStorage.getItem('usuarioEmail');
    const token = sessionStorage.getItem('alterar_senha_token');
    if (!email || !token) {
      Swal.fire({ icon: 'error', title: 'Fluxo inválido', text: 'Tente novamente.', confirmButtonColor: '#5084C1' });
      this.router.navigate(['']);
      return;
    }

    this.authService.alterarSenha(email, token, this.senha).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Senha alterada', confirmButtonColor: '#5084C1' }).then(()=>{
          sessionStorage.removeItem('alterar_senha_token');
          this.router.navigate(['minha-conta-info']);
        });
      },
      error: (err) => {
        const msg = err?.error || 'Erro ao alterar senha';
        Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#5084C1' });
      }
    });
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['minha-conta-senha-codigo-verificacao']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }

}

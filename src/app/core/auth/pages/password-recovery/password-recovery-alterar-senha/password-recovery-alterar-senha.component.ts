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
  selector: 'app-password-recovery-alterar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderPasswordRecoveryComponent],
  templateUrl: './password-recovery-alterar-senha.component.html',
  styleUrl: './password-recovery-alterar-senha.component.css'
})
export class PasswordRecoveryAlterarSenhaComponent {

  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  public senha: string = '';
  public confirmarSenha: string = '';

  public showSenha: boolean = false;
  public showConfirmarSenha: boolean = false;

  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  private email: string = '';
  private token: string = '';

  constructor() {
    const storedEmail = sessionStorage.getItem('password_recovery_email');
    const storedToken = sessionStorage.getItem('password_recovery_token');
    if (storedEmail) this.email = storedEmail;
    if (storedToken) this.token = storedToken;
  }

  public criarNovaSenha(): void {
    if (this.senha !== this.confirmarSenha) {
      Swal.fire({ icon: 'warning', title: 'Atenção', text: 'As senhas não coincidem.', confirmButtonColor: '#5084C1' });
      return;
    }

    this.authenticationService.redefinirSenha(this.email, this.token, this.senha).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Senha redefinida com sucesso', confirmButtonColor: '#5084C1' });
        sessionStorage.removeItem('password_recovery_email');
        sessionStorage.removeItem('password_recovery_token');
        this.router.navigate(['']);
      },
      error: (err) => {
        console.log('erro', err);
        const mensagem = err?.error.novaSenha || err?.error.message || 'Não foi possível redefinir a senha.';
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem, confirmButtonColor: '#5084C1' });
      }
    });
  }

  public voltar(): void {
    this.router.navigate(['password-recovery-codigo-verificacao']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }

}

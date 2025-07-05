import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";
import { AuthenticationService } from '../../../services/auth.service';


@Component({
  selector: 'app-signup-verificacao',
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './signup-verificacao.component.html',
  styleUrl: './signup-verificacao.component.css'
})
export class SignupVerificacaoComponent {

  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  public senha: string = '';
  public confirmarSenha: string = '';

  public showSenha: boolean = false;
  public showConfirmarSenha: boolean = false;

  public emailDestino: string = '';

  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  constructor() {
    const usuarioJson = sessionStorage.getItem('signup_usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.emailDestino = usuario.email || '';
      } catch (_) {}
    }
  }

  public avancar(): void {

    if (this.senha !== this.confirmarSenha) {
      Swal.fire({ icon: 'warning', title: 'Atenção', text: 'As senhas não coincidem.', confirmButtonColor: '#5084C1' });
      return;
    }

    sessionStorage.setItem('signup_senha', this.senha);

    this.router.navigate(['signup-validar-identidade']);
  }

  public voltar(): void {
    this.router.navigate(['signup-senha']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }


  public receberCodigo(): void {
    if (!this.emailDestino) {
      Swal.fire({ icon: 'warning', title: 'E-mail não informado', text: 'Volte e preencha os dados novamente.', confirmButtonColor: '#5084C1' });
      return;
    }

    this.authenticationService.enviarOtpEmail(this.emailDestino).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Código enviado', confirmButtonColor: '#5084C1' });
        if (this.senha && !sessionStorage.getItem('signup_senha')) {
          sessionStorage.setItem('signup_senha', this.senha);
        }
        this.router.navigate(['signup-validar-identidade']);
      },
      error: (err) => {
        const mensagem = err?.error?.message ?? (typeof err?.error === 'string' ? err.error : err.message) ?? 'Não foi possível enviar o código. Verifique os dados e tente novamente.';
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem, confirmButtonColor: '#5084C1' });
      }
    });
  }

}

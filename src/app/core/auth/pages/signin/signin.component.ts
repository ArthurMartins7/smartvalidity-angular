import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AssinaturaExistenteModalComponent } from '../../../../components/assinatura-existente-modal/assinatura-existente-modal.component';
import { Usuario } from '../../../../shared/model/entity/usuario.model';
import { AuthenticationService } from '../../services/auth.service';


@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, AssinaturaExistenteModalComponent],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  public usuario = new Usuario();
  public showSenha: boolean = false;
  public exibirModalAssinaturaExistente: boolean = false;

  realizarLogin(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    localStorage.removeItem('tokenUsuarioAutenticado');
    this.authenticationService.authenticate(this.usuario).subscribe({
      next: (jwt) => {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Usuário autenticado com sucesso',
          confirmButtonColor: '#5084C1'
        });
        let token: string = jwt.body + '';
        localStorage.setItem('tokenUsuarioAutenticado', token);

        this.buscarPerfilUsuario();
      },
      error: (erro) => {
        let mensagem: string;
        console.log('erro: ', erro);
        if (erro.status == 401) {
          mensagem = 'Usuário ou senha inválidos, tente novamente';
        } else {
          mensagem = erro.error;
        }

        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: mensagem,
          confirmButtonColor: '#5084C1'
        });
      },
    });
  }

  private buscarPerfilUsuario() {
    this.authenticationService.getCurrentUser().subscribe({
      next: (usuarioLogado) => {
        sessionStorage.setItem('usuarioEmail', usuarioLogado.email);
        sessionStorage.setItem('usuarioNome', usuarioLogado.nome);
        sessionStorage.setItem('usuarioPerfil', usuarioLogado.perfilAcesso);

        this.verificarPerfilAcesso();
      },
      error: (erro) => {
        console.error('Erro ao obter perfil do usuário:', erro);
        sessionStorage.setItem('usuarioEmail', this.usuario.email);
        sessionStorage.setItem('usuarioNome', 'Usuário do Sistema');

        this.verificarPerfilAcesso();
      }
    });
  }

  realizarCadastro() {
    this.authenticationService.verificarAssinaturaExistente().subscribe({
      next: (existeAssinante) => {
        console.log('existeAssinante: ', existeAssinante);
        if (existeAssinante) {
          this.exibirModalAssinaturaExistente = true;
        } else {
          this.router.navigate(['/signup-info-pessoais']);
        }
      },
      error: (erro) => {
        console.error('Erro ao verificar assinatura:', erro);
        this.exibirModalAssinaturaExistente = true;
      }
    });
  }

  public esqueceuSenha() {
    this.router.navigate(['password-recovery-validar-identidade']);
  }

  public verificarPerfilAcesso() {
    this.router.navigate(['/mural-listagem']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public onSenhaInput(input: HTMLInputElement): void {
    const isOnlyWhitespace = input.value.trim().length === 0;
    if (isOnlyWhitespace) {
      input.setCustomValidity('A senha não pode ser vazia ou conter somente espaços.');
    } else {
      input.setCustomValidity('');
    }
  }

}

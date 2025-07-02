import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  realizarLogin() {
    //console.log('usuarioDTO: ', this.usuarioDTO);
    localStorage.removeItem('tokenUsuarioAutenticado');
    this.authenticationService.authenticate(this.usuario).subscribe({
      next: (jwt) => {
        Swal.fire('Sucesso', 'Usuário autenticado com sucesso', 'success');
        let token: string = jwt.body + '';
        localStorage.setItem('tokenUsuarioAutenticado', token);

        // Buscar o perfil completo do usuário atual
        this.buscarPerfilUsuario();
      },
      error: (erro) => {
        var mensagem: string;
        if (erro.status == 401) {
          mensagem = 'Usuário ou senha inválidos, tente novamente';
        } else {
          mensagem = erro.error;
        }

        Swal.fire('Erro', mensagem, 'error');
      },
    });
  }

  private buscarPerfilUsuario() {
    this.authenticationService.getCurrentUser().subscribe({
      next: (usuarioLogado) => {
        // Armazenar o nome e email do usuário no sessionStorage
        sessionStorage.setItem('usuarioEmail', usuarioLogado.email);
        sessionStorage.setItem('usuarioNome', usuarioLogado.nome);

        this.verificarPerfilAcesso();
      },
      error: (erro) => {
        console.error('Erro ao obter perfil do usuário:', erro);
        // Como fallback, salvar apenas o email que usou para login
        sessionStorage.setItem('usuarioEmail', this.usuario.email);
        // Como não conseguimos obter o nome, usar uma mensagem padrão
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
          // Já existe um usuário assinante, exibe modal e impede cadastro
          this.exibirModalAssinaturaExistente = true;
        } else {
          // Nenhum assinante encontrado, prossegue para fluxo de cadastro
          this.router.navigate(['/signup-info-pessoais']);
        }
      },
      error: (erro) => {
        console.error('Erro ao verificar assinatura:', erro);
        // Em caso de erro na verificação, por segurança impedir cadastro e notificar usuário
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

}

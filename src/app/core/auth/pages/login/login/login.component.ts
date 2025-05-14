import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { AuthenticationService } from '../../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  public usuario = new Usuario();

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
    this.router.navigate(['/register']);
  }

  public verificarPerfilAcesso() {
    this.router.navigate(['/entrada-estoque']);
  }
}

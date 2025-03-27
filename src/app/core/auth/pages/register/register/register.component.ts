import { Component, inject, OnInit } from '@angular/core';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UsuarioService } from '../../../../../shared/service/usuario.service';
import { PerfilAcesso } from '../../../../../shared/model/enum/perfil-acesso.enum';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthenticationService);
  private usuarioService = inject(UsuarioService);

  public usuario = new Usuario();
  public usuarios : Usuario[] = []
  public perfisDeAcesso : string[] = Object.values(PerfilAcesso);

  ngOnInit(): void {

  }

  public buscarTodosUsuarios() {
    this.usuarioService.buscarTodos().subscribe(
      (resultado) => {
        this.usuarios = resultado;
      },
      (erro) => {
        console.error('Erro ao consultar todos os usuários', erro.error);
      }
      );
  }

  public cadastrar() {
    console.log('usuario: ', this.usuario);
    this.authService.register(this.usuario).subscribe(
      (resultado) => {
        Swal.fire({
          title: "Cadastro realizado com sucesso!",
          text: "",
          icon: "success",
          showConfirmButton: true,
          confirmButtonColor: "#bef264"
        })
        this.voltar();
      },
      (erro) => {
        Swal.fire({
          title: "Erro ao realizar cadastro",
          text: erro.error,
          icon: "error",
          showConfirmButton: true,
          confirmButtonColor: "#bef264"
        })
      }
    )
  }

  public voltar() {
    this.router.navigate([''])
  }



}

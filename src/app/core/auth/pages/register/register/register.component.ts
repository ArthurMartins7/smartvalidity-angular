import { Component, inject } from '@angular/core';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthenticationService);

  public usuario = new Usuario();

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

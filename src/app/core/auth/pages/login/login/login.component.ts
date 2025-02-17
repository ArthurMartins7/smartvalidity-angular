import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  public usuario = new Usuario();

  realizarLogin() {

  }

  realizarCadastro() {

  }

}

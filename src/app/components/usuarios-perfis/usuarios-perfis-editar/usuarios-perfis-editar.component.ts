import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-usuarios-perfis-editar',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-perfis-editar.component.html',
  styleUrl: './usuarios-perfis-editar.component.css'
})
export class UsuariosPerfisEditarComponent {

  usuario = {
    nome: 'Arthur Bowens',
    email: 'arthur2@gmail.com',
    perfilAcesso: 'ADMIN',
    dataCriacao: '30/05/2025',
    cargo: 'Gerente',
  };

  empresa = {
    cnpj: '73.266.899/0001-62',
    razaoSocial: 'Hiperbom Supermercados Ltda'
  };

}

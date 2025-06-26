import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-minha-conta-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './minha-conta-editar.component.html',
  styleUrl: './minha-conta-editar.component.css'
})
export class MinhaContaEditarComponent {

  usuario = {
    nome: 'Arthur Martins',
    email: 'arthur@gmail.com',
    perfilAcesso: 'Assinante',
    dataCriacao: '25/05/2025',
    cargo: 'Dono',
  };

  empresa = {
    cnpj: '73.266.899/0001-62',
    razaoSocial: 'Hiperbom Supermercados Ltda'
  };
}

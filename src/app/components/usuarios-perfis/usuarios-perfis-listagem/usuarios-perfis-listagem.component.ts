import { Component, inject, OnInit } from '@angular/core';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-usuarios-perfis-listagem',
  imports: [],
  templateUrl: './usuarios-perfis-listagem.component.html',
  styleUrl: './usuarios-perfis-listagem.component.css'
})
export class UsuariosPerfisListagemComponent implements OnInit {

  private usuarioService = inject(UsuarioService);

  usuarios: Usuario[] = [];

  ngOnInit(): void {
    this.buscarTodosUsuarios();
  }

  public buscarTodosUsuarios() {
    this.usuarioService.buscarTodos().subscribe(
      (response) => {
        this.usuarios = response;
      },
      (erro) => {
        console.error('Erro ao buscar todos os usuários', erro);
      }
    );
  }

}

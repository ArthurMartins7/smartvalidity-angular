import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { UsuarioService } from '../../../shared/service/usuario.service';
import { ConvidarUsuarioModalComponent } from '../convidar-usuario-modal/convidar-usuario-modal.component';

@Component({
  selector: 'app-usuarios-perfis-listagem',
  imports: [CommonModule, FormsModule, ConvidarUsuarioModalComponent],
  templateUrl: './usuarios-perfis-listagem.component.html',
  styleUrl: './usuarios-perfis-listagem.component.css'
})
export class UsuariosPerfisListagemComponent implements OnInit {

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuarios: Usuario[] = [];

  // Pagination
  itemsPerPageOptions: number[] = [5, 10, 25, 50];
  itemsPerPage = 10;
  currentPage = 1;

  mostrarModalConvite = false;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.usuarios.length / this.itemsPerPage));
  }

  get paginatedUsers(): Usuario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.usuarios.slice(start, end);
  }

  ngOnInit(): void {
    this.buscarUsuariosAtivos();
  }

  private buscarUsuariosAtivos(): void {
    this.usuarioService.listarAtivos().subscribe(
      (response) => {
        this.usuarios = response;
        this.currentPage = 1;
      },
      (erro) => {
        console.error('Erro ao buscar usuários ativos', erro);
      }
    );
  }

  editarUsuario(usuario: Usuario): void {
    if (usuario && usuario.id) {
      this.router.navigate(['/usuarios-perfis-editar', usuario.id]);
    }
  }

  excluirUsuario(usuario: Usuario): void {
    if (!usuario?.id) { return; }

    Swal.fire({
      icon: 'warning',
      title: 'Confirmar exclusão',
      text: `Deseja excluir o usuário ${usuario.nome}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.excluir(usuario.id!).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Excluído', text: 'Usuário excluído com sucesso', confirmButtonColor: '#5084C1' });
            this.buscarUsuariosAtivos();
          },
          error: (err) => {
            console.error('Erro ao excluir usuario', err);
            const msg = err?.error?.message || 'Erro ao excluir usuário.';
            Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#5084C1' });
          }
        });
      }
    });
  }

  public navegarParaUsuariosPendentes(): void {
    this.router.navigate(['/usuarios-perfis-pendentes']);
  }

  onItemsPerPageChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.itemsPerPage = value;
    this.currentPage = 1;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  abrirModalConvite(): void {
    this.mostrarModalConvite = true;
  }

  onInvited(): void {
    this.mostrarModalConvite = false;
    // user still pending, but we can refresh list if backend marks as active immediately
    this.buscarUsuariosAtivos();
  }

}

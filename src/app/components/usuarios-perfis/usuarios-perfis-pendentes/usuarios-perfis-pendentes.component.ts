import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { UsuarioService } from '../../../shared/service/usuario.service';
import { ConvidarUsuarioModalComponent } from '../convidar-usuario-modal/convidar-usuario-modal.component';

@Component({
  selector: 'app-usuarios-perfis-pendentes',
  imports: [CommonModule, FormsModule, RouterModule, ConvidarUsuarioModalComponent],
  templateUrl: './usuarios-perfis-pendentes.component.html',
  styleUrl: './usuarios-perfis-pendentes.component.css'
})
export class UsuariosPerfisPendentesComponent {

  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  usuarios: Usuario[] = [];

  // Pagination
  itemsPerPageOptions: number[] = [5, 10, 25, 50];
  itemsPerPage = 10;
  currentPage = 1;

  mostrarModalConvite = false;
  reenviandoConviteId: string | null = null;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.usuarios.length / this.itemsPerPage));
  }

  get paginatedUsers(): Usuario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.usuarios.slice(start, end);
  }

  ngOnInit(): void {
    this.buscarPendentes();
  }

  private buscarPendentes(): void {
    this.usuarioService.listarPendentes().subscribe(
      (response) => {
        this.usuarios = response;
        this.currentPage = 1; // Reset page on new data
      },
      (erro) => {
        console.error('Erro ao buscar usuários pendentes', erro);
      }
    );
  }

  public navegarParaUsuariosPendentes(): void {
    this.router.navigate(['/usuarios-perfis-pendentes']);
  }

  public navegarParaMinhaEquipe(): void {
    this.router.navigate(['/usuarios-perfis-listagem']);
  }

  onItemsPerPageChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.itemsPerPage = value;
    this.currentPage = 1; // Reset to first page when page size changes
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
    this.buscarPendentes();
  }

  reenviarConvite(usuario: Usuario): void {
    if (!usuario?.id) {
      return;
    }

    // Define loading state
    this.reenviandoConviteId = usuario.id;

    this.usuarioService.reenviarConvite(usuario.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Convite reenviado',
          text: `Um novo convite foi enviado para ${usuario.email}.`,
          confirmButtonColor: '#5084C1'
        });
        this.reenviandoConviteId = null;
      },
      error: (err) => {
        console.error('Erro ao reenviar convite', err);
        const msg = err?.error?.message || 'Erro ao reenviar convite.';
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: msg,
          confirmButtonColor: '#5084C1'
        });
        this.reenviandoConviteId = null;
      }
    });
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
            this.buscarPendentes();
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

}

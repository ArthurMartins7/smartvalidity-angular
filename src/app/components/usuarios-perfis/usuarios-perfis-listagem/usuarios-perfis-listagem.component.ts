import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    this.buscarTodosUsuarios();
  }

  public buscarTodosUsuarios() {
    this.usuarioService.buscarTodos().subscribe(
      (response) => {
        this.usuarios = response;
        this.currentPage = 1; // Reset page on new data
      },
      (erro) => {
        console.error('Erro ao buscar todos os usuários', erro);
      }
    );
  }

  public navegarParaUsuariosPendentes(): void {
    this.router.navigate(['/usuarios-perfis-pendentes']);
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

}

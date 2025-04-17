import { Component, OnInit } from '@angular/core';
import { Categoria } from '../../../../shared/model/entity/categoria';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../../shared/service/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categoria-editar',
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria-editar.component.html',
  styleUrl: './categoria-editar.component.css'
})
export class CategoriaEditarComponent implements OnInit {
  public categoria: Categoria = new Categoria();
  public categoriaId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriaService: CategoriaService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoriaId = params['id'];
      if (this.categoriaId) {
        this.buscarCategoria();
      }
    });
  }

  buscarCategoria(): void {
    this.categoriaService.buscarPorId(this.categoriaId).subscribe({
      next: (categoria) => {
        this.categoria = categoria;
      },
      error: (erro) => {
        console.error('Erro ao buscar categoria:', erro);
        Swal.fire('Erro', 'Não foi possível carregar a categoria', 'error');
        this.voltar();
      }
    });
  }

  salvar(event: Event): void {
    event.preventDefault();
    this.atualizar();
  }

  atualizar(): void {
    this.categoriaService.atualizarCategoria(this.categoriaId, this.categoria).subscribe({
      next: () => {
        Swal.fire('Categoria atualizada com sucesso!', '', 'success');
        this.voltar();
      },
      error: (erro) => {
        Swal.fire('Erro ao atualizar a categoria: ' + erro.error, '', 'error');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/corredor']);
  }
}

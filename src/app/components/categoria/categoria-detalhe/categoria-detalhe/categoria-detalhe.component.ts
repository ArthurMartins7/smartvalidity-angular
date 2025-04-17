import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../../shared/model/entity/categoria';
import { CategoriaService } from '../../../../shared/service/categoria.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categoria-detalhe',
  imports: [FormsModule],
  templateUrl: './categoria-detalhe.component.html',
  styleUrl: './categoria-detalhe.component.css'
})
export class CategoriaDetalheComponent implements OnInit {
  public categoria: Categoria = new Categoria();
  public corredorId: string;
  public categoriaId: string;
  public isEdicao: boolean = false;

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.categoriaId = params['id'] || '';
      this.corredorId = params['corredorId'] || '';

      console.log('IDs recebidos:', { categoriaId: this.categoriaId, corredorId: this.corredorId });

      if (this.categoriaId) {
        this.isEdicao = true;
        this.buscarCategoria();
      } else if (this.corredorId) {
        this.categoria.corredor = { id: this.corredorId };
      }
    });
  }

  buscarCategoria(): void {
    if (this.categoriaId) {
      this.categoriaService.buscarPorId(this.categoriaId).subscribe({
        next: (categoria) => {
          console.log('Categoria recebida do backend:', categoria);
          this.categoria = categoria;

          // Manter o ID do corredor existente
          if (!this.categoria.corredor?.id && this.corredorId) {
            console.log('Usando corredorId da URL:', this.corredorId);
            this.categoria.corredor = { id: this.corredorId };
          }
        },
        error: (erro) => {
          console.error('Erro ao buscar categoria:', erro);
          Swal.fire('Erro', 'Não foi possível carregar a categoria', 'error');
          this.voltar();
        }
      });
    }
  }

  salvar(event: Event): void {
    event.preventDefault();
    if (this.isEdicao) {
      this.atualizar();
    } else {
      this.inserir();
    }
  }

  inserir(): void {
    this.categoriaService.criarCategoria(this.categoria).subscribe({
      next: () => {
        Swal.fire('Categoria salva com sucesso!', '', 'success');
        this.voltar();
      },
      error: (erro) => {
        Swal.fire('Erro ao salvar a categoria: ' + erro.error, '', 'error');
      }
    });
  }

  atualizar(): void {
    console.log('Tentando atualizar com:', {
      categoriaId: this.categoriaId,
      corredorId: this.corredorId,
      categoria: this.categoria
    });

    if (!this.categoriaId) {
      Swal.fire('Erro', 'ID da categoria não encontrado', 'error');
      return;
    }

    // Usar o ID do corredor da URL, que é o valor correto
    if (!this.corredorId) {
      console.error('ID do corredor não encontrado na URL');
      Swal.fire('Erro', 'ID do corredor não encontrado', 'error');
      return;
    }

    const categoriaAtualizada = new Categoria();
    categoriaAtualizada.nome = this.categoria.nome;
    categoriaAtualizada.corredor = { id: this.corredorId };

    console.log('Dados enviados para atualização:', categoriaAtualizada);

    this.categoriaService.atualizarCategoria(this.categoriaId, categoriaAtualizada).subscribe({
      next: () => {
        Swal.fire('Categoria atualizada com sucesso!', '', 'success');
        this.voltar();
      },
      error: (erro) => {
        console.error('Erro ao atualizar categoria:', erro);
        console.error('Detalhes do erro:', erro.error);
        const mensagemErro = erro.error?.mensagem || erro.error?.message || erro.message || 'Erro desconhecido';
        Swal.fire('Erro', 'Não foi possível atualizar a categoria: ' + mensagemErro, 'error');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/corredor']);
  }
}

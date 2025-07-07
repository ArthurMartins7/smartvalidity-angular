import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Produto } from '../../../../shared/model/entity/produto';
import { Fornecedor } from '../../../../shared/model/entity/fornecedor';
import { ProdutoService } from '../../../../shared/service/produto.service';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-produto-editar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './produto-editar.component.html',
  styleUrl: './produto-editar.component.css'
})
export class ProdutoEditarComponent implements OnInit {

  public produto: Produto = new Produto();
  public idProduto: string;
  public fornecedores: Fornecedor[] = [];
  public fornecedorSelecionado: string;
  public categoriaId: string | null = null;
  public categoriaNome: string = '';

  constructor(
    private produtoService: ProdutoService,
    private fornecedorService: FornecedorService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.idProduto = this.activatedRoute.snapshot.paramMap.get('id') || '';
    if (this.idProduto) {
      this.carregarFornecedores().then(() => {
        this.carregarProduto();
      });
    }
  }

  public carregarProduto(): void {
    this.produtoService.buscarPorId(this.idProduto).subscribe(
      (produto) => {
        this.produto = produto;
        if (produto.fornecedores && produto.fornecedores.length > 0) {
          this.fornecedorSelecionado = produto.fornecedores[0].id;
        }
        if (produto.categoria) {
          this.categoriaId = produto.categoria.id;
          this.categoriaNome = produto.categoria.nome;
        }
      },
      (erro) => {
        console.error('Erro ao carregar produto:', erro);
        Swal.fire('Erro', 'Não foi possível carregar o produto!', 'error');
      }
    );
  }

  public carregarFornecedores(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fornecedorService.listarTodos().subscribe(
        (fornecedores) => {
          this.fornecedores = fornecedores;
          resolve();
        },
        (erro) => {
          console.error('Erro ao carregar fornecedores:', erro);
          Swal.fire('Erro', 'Não foi possível carregar os fornecedores!', 'error');
          reject(erro);
        }
      );
    });
  }

  atualizar(event: Event): void {
    event.preventDefault();

    // Validações de campo – mensagens específicas
    if (!this.produto.codigoBarras || this.produto.codigoBarras.trim() === '') {
      Swal.fire('Código de barras obrigatório', 'Informe o código de barras do produto.', 'warning');
      return;
    }

    if (!this.produto.descricao || this.produto.descricao.trim() === '') {
      Swal.fire('Descrição obrigatória', 'Informe a descrição do produto.', 'warning');
      return;
    }

    if (this.produto.quantidade == null) {
      Swal.fire('Quantidade obrigatória', 'Informe a quantidade do produto.', 'warning');
      return;
    }

    if (this.produto.quantidade <= 0) {
      Swal.fire('Quantidade inválida', 'A quantidade deve ser maior ou igual a 1.', 'warning');
      return;
    }

    if (!this.fornecedorSelecionado) {
      Swal.fire('Fornecedor obrigatório', 'Selecione um fornecedor.', 'warning');
      return;
    }

    // Cria um objeto simplificado do produto para enviar ao backend
    const produtoParaSalvar: any = {
      id: this.idProduto,
      codigoBarras: this.produto.codigoBarras,
      descricao: this.produto.descricao,
      marca: this.produto.marca,
      unidadeMedida: this.produto.unidadeMedida,
      quantidade: this.produto.quantidade,
      fornecedores: [
        {
          id: this.fornecedorSelecionado
        }
      ],
      categoria: this.categoriaId ? {
        id: this.categoriaId
      } : null,
      itensProduto: []
    };

    // Atualiza o produto
    this.produtoService.atualizarProduto(this.idProduto, produtoParaSalvar)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao atualizar o produto:', error);

          let mensagem = 'Erro ao atualizar o produto.';
          if (error.error) {
            const payload = error.error;
            if (payload.message) {
              mensagem = payload.message;
            } else if (typeof payload === 'object') {
              mensagem = Object.values(payload).join(' / ');
            } else if (typeof payload === 'string') {
              mensagem = payload;
            }
          }

          Swal.fire({
            title: 'Erro',
            text: mensagem,
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return throwError(error);
        })
      )
      .subscribe({
        next: () => {
          Swal.fire('Produto atualizado com sucesso!', '', 'success');
          this.voltar();
        }
      });
  }

  public voltar(): void {
    this.location.back();
  }
}

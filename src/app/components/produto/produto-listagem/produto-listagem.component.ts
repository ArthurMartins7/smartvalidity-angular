import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../shared/service/fornecedor.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Fornecedor } from '../../../shared/model/entity/fornecedor';
import { Produto } from '../../../shared/model/entity/produto';
import { ProdutoService } from '../../../shared/service/produto.service';
import { CategoriaService } from '../../../shared/service/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-produto-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './produto-listagem.component.html',
  styleUrl: './produto-listagem.component.css'
})
export class ProdutoListagemComponent implements OnInit{

  private fornecedorService = inject(FornecedorService);
  private produtoService = inject(ProdutoService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public Produto = new Produto();
  public produtos: Produto[] = [];
  public Fornecedor = new Fornecedor();
  public fornecedores: Fornecedor[] = [];
  public categoriaId: string | null = null;
  public categoriaNome: string = '';
  public categoria: any;

  ngOnInit(): void {
    this.buscarFornecedores().then(() => {
      this.route.queryParams.subscribe(params => {
        const categoriaIdParam = params['categoriaId'];
        const categoriaNomeParam = params['categoriaNome'];

        if (categoriaIdParam) {
          this.categoriaId = categoriaIdParam;
          this.categoriaNome = categoriaNomeParam || '';
          this.buscarProdutos();
        } else {
          this.categoriaId = null;
          this.categoriaNome = '';
          this.buscarProdutos();
        }
      });
    });
  }

  public buscarFornecedores() {
    return new Promise<void>((resolve) => {
      this.fornecedorService.listarTodos().subscribe(
        (resultado) => {
          this.fornecedores = resultado;
          console.log('Fornecedores carregados:', this.fornecedores);
          resolve();
        },
        (erro) => {
          console.error('Erro ao consultar todos os fornecedores', erro.error.mensagem);
          resolve();
        }
      );
    });
  }

  public buscarCategoria(): void {
    if (this.categoriaId) {
      console.log('Buscando detalhes da categoria:', this.categoriaId);
      this.categoriaService.buscarPorId(this.categoriaId).subscribe({
        next: (categoria) => {
          console.log('Categoria encontrada:', categoria);
          this.categoriaNome = categoria.nome;
          this.categoria = categoria;
        },
        error: (erro) => {
          console.error('Erro ao buscar categoria:', erro);
          Swal.fire('Erro', 'Não foi possível carregar a categoria', 'error');
        }
      });
    }
  }

  public buscarProdutos() {
    if (this.categoriaId) {
      console.log('Fetching products for category ID:', this.categoriaId);
      this.produtoService.listarPorCategoria(this.categoriaId.toString()).subscribe({
        next: (resultado) => {
          console.log('Products received from API:', resultado);
          // Criar uma nova instância para cada produto e seus fornecedores
          this.produtos = resultado.map(produto => {
            const novoProduto = { ...produto };
            if (novoProduto.fornecedores && novoProduto.fornecedores.length > 0) {
              // Garantir que cada fornecedor seja uma cópia independente
              novoProduto.fornecedores = novoProduto.fornecedores.map(fornecedor => {
                // Se o fornecedor for um número ou string, buscar o fornecedor completo
                if (typeof fornecedor === 'number' || typeof fornecedor === 'string') {
                  const fornecedorId = Number(fornecedor); // Converte para número
                  const fornecedorCompleto = this.fornecedores.find(f => Number(f.id) === fornecedorId);
                  if (fornecedorCompleto) {
                    const novoFornecedor = new Fornecedor();
                    Object.assign(novoFornecedor, fornecedorCompleto);
                    novoFornecedor.produtos = [];
                    return novoFornecedor;
                  }
                  return null; // Retorna null se não encontrar o fornecedor
                }
                // Se já for um objeto fornecedor, criar uma cópia
                const novoFornecedor = new Fornecedor();
                Object.assign(novoFornecedor, fornecedor);
                novoFornecedor.produtos = [];
                return novoFornecedor;
              }).filter(f => f !== null); // Remove os fornecedores null
            }
            return novoProduto;
          });
          console.log('Produtos processados:', this.produtos);
        },
        error: (erro) => {
          console.error('Error fetching products by category:', erro);
          console.error('Error details:', erro.error?.mensagem || erro.message);
        }
      });
    } else {
      console.log('Fetching all products');
      this.produtoService.listarTodos().subscribe({
        next: (resultado) => {
          console.log('All products received from API:', resultado);
          // Criar uma nova instância para cada produto e seus fornecedores
          this.produtos = resultado.map(produto => {
            const novoProduto = { ...produto };
            if (novoProduto.fornecedores && novoProduto.fornecedores.length > 0) {
              // Garantir que cada fornecedor seja uma cópia independente
              novoProduto.fornecedores = novoProduto.fornecedores.map(fornecedor => {
                // Se o fornecedor for um número ou string, buscar o fornecedor completo
                if (typeof fornecedor === 'number' || typeof fornecedor === 'string') {
                  const fornecedorId = Number(fornecedor); // Converte para número
                  const fornecedorCompleto = this.fornecedores.find(f => Number(f.id) === fornecedorId);
                  if (fornecedorCompleto) {
                    const novoFornecedor = new Fornecedor();
                    Object.assign(novoFornecedor, fornecedorCompleto);
                    novoFornecedor.produtos = [];
                    return novoFornecedor;
                  }
                  return null; // Retorna null se não encontrar o fornecedor
                }
                // Se já for um objeto fornecedor, criar uma cópia
                const novoFornecedor = new Fornecedor();
                Object.assign(novoFornecedor, fornecedor);
                novoFornecedor.produtos = [];
                return novoFornecedor;
              }).filter(f => f !== null); // Remove os fornecedores null
            }
            return novoProduto;
          });
          console.log('Produtos processados:', this.produtos);
        },
        error: (erro) => {
          console.error('Error fetching all products:', erro);
          console.error('Error details:', erro.error?.mensagem || erro.message);
        }
      });
    }
  }

  excluir(produtoSelecionado: Produto) {
    Swal.fire({
      title: 'Deseja realmente excluir o produto?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.produtoService.excluirProduto(produtoSelecionado.id).subscribe(
          () => {
            this.produtos = this.produtos.filter(c => c.id !== produtoSelecionado.id);
            Swal.fire('Excluído!', 'O produto foi removido com sucesso.', 'success');
          },
        );
      }
    });
  }

  editar(produtoSelecionado: Produto){
    this.router.navigate(['/produto-editar/', produtoSelecionado]);
  }

  public adicionarProduto() {
    if (this.categoriaId) {
      this.router.navigate(['produto-detalhe'], {
        queryParams: {
          categoriaId: this.categoriaId,
          categoriaNome: this.categoriaNome
        }
      });
    } else {
      this.router.navigate(['produto-detalhe']);
    }
  }

  public editarCategoria() {
    const categoriaId = this.categoriaId;
    if (categoriaId) {
      // Buscar a categoria primeiro
      this.categoriaService.buscarPorId(categoriaId).subscribe({
        next: (categoria) => {
          console.log('Categoria encontrada:', categoria);

          // Buscar o ID do corredor da categoria
          this.categoriaService.buscarCorredorDaCategoria(categoriaId).subscribe({
            next: (corredorId: number) => {
              console.log('ID do corredor encontrado:', corredorId);

              // Navegar para a edição com o ID da categoria e do corredor
              this.router.navigate(['/categoria-detalhe'], {
                queryParams: {
                  id: categoriaId,
                  corredorId: corredorId.toString()
                }
              });
            },
            error: (erro: any) => {
              console.error('Erro ao buscar corredor:', erro);
              Swal.fire('Erro', 'Não foi possível carregar o corredor', 'error');
            }
          });
        },
        error: (erro: any) => {
          console.error('Erro ao buscar categoria:', erro);
          Swal.fire('Erro', 'Não foi possível carregar a categoria', 'error');
        }
      });
    }
  }

  public excluirCategoria() {
    if (this.categoriaId) {
      const id = this.categoriaId;
      Swal.fire({
        title: 'Deseja realmente excluir a categoria?',
        text: 'Todos os produtos desta categoria serão removidos!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.categoriaService.excluirCategoria(id).subscribe({
            next: () => {
              Swal.fire('Excluído!', 'A categoria foi removida com sucesso.', 'success');
              this.router.navigate(['/corredor']);
            },
            error: (erro) => {
              console.error('Erro ao excluir categoria:', erro);
              Swal.fire('Erro!', 'Não foi possível excluir a categoria: ' + (erro.error?.mensagem || erro.message), 'error');
            }
          });
        }
      });
    }
  }

  irParaEntradaEstoque(produto: Produto) {
    this.router.navigate(['/entrada-estoque'], {
      queryParams: {
        produtoId: produto.id
      }
    });
  }
}

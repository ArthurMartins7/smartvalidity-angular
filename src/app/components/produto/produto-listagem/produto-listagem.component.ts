import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../shared/service/fornecedor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Fornecedor } from '../../../shared/model/entity/fornecedor';
import { Produto } from '../../../shared/model/entity/produto';
import { ProdutoService } from '../../../shared/service/produto.service';
import { CategoriaService } from '../../../shared/service/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-produto-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  ngOnInit(): void {
    this.buscarFornecedores();
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
  }

  public buscarFornecedores() {
    this.fornecedorService.listarTodos().subscribe(
      (resultado) => {
        this.fornecedores = resultado;
        console.log(this.fornecedores);
      },
      (erro) => {
        console.error('Erro ao consultar todos os fornecedores', erro.error.mensagem);
      }
    );
  }

  public buscarCategoria(): void {
    if (this.categoriaId) {
      console.log('Buscando detalhes da categoria:', this.categoriaId);
      this.categoriaService.buscarPorId(Number(this.categoriaId)).subscribe({
        next: (categoria) => {
          console.log('Categoria encontrada:', categoria);
          this.categoriaNome = categoria.nome;
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
                const novoFornecedor = new Fornecedor();
                novoFornecedor.id = fornecedor.id;
                novoFornecedor.nome = fornecedor.nome;
                novoFornecedor.telefone = fornecedor.telefone;
                novoFornecedor.cnpj = fornecedor.cnpj;
                novoFornecedor.endereco = fornecedor.endereco;
                novoFornecedor.produtos = [];
                return novoFornecedor;
              });
            }
            return novoProduto;
          });
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
                const novoFornecedor = new Fornecedor();
                novoFornecedor.id = fornecedor.id;
                novoFornecedor.nome = fornecedor.nome;
                novoFornecedor.telefone = fornecedor.telefone;
                novoFornecedor.cnpj = fornecedor.cnpj;
                novoFornecedor.endereco = fornecedor.endereco;
                novoFornecedor.produtos = [];
                return novoFornecedor;
              });
            }
            return novoProduto;
          });
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
}

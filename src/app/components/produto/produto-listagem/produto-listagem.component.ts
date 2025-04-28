import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../shared/service/fornecedor.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Fornecedor } from '../../../shared/model/entity/fornecedor';
import { Produto } from '../../../shared/model/entity/produto';
import { ProdutoService } from '../../../shared/service/produto.service';
import { CategoriaService } from '../../../shared/service/categoria.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CorredorService } from '../../../shared/service/corredor.service';

@Component({
  selector: 'app-produto-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, DragDropModule],
  templateUrl: './produto-listagem.component.html',
  styleUrl: './produto-listagem.component.css'
})
export class ProdutoListagemComponent implements OnInit, OnDestroy {

  private fornecedorService = inject(FornecedorService);
  private produtoService = inject(ProdutoService);
  private categoriaService = inject(CategoriaService);
  private corredorService = inject(CorredorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  public Produto = new Produto();
  public produtos: Produto[] = [];
  public Fornecedor = new Fornecedor();
  public fornecedores: Fornecedor[] = [];
  public categoriaId: string | null = null;
  public categoriaNome: string = '';
  public categoria: any;

  // Propriedades para paginação
  public totalPaginas: number = 0;
  public tamanhoPagina: number = 5;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public itensPorPagina: number = 5;
  public paginaAtual: number = 1;

  // Propriedades para filtros
  public mostrarFiltros: boolean = false;
  public filtroCodigoBarras: string = '';
  public filtroDescricao: string = '';
  public filtroMarca: string = '';
  public filtroUnidadeMedida: string = '';
  public filtroFornecedor: Fornecedor | null = null;

  // Seletor para busca
  public seletor: any = {
    codigoBarras: '',
    descricao: '',
    marca: '',
    unidadeMedida: '',
    fornecedorId: null,
    categoriaId: null,
    pagina: 1,
    limite: 5
  };

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.buscarFornecedores().then(() => {
      this.route.queryParams.subscribe(params => {
        const categoriaIdParam = params['categoriaId'];
        const categoriaNomeParam = params['categoriaNome'];

        if (categoriaIdParam) {
          this.categoriaId = categoriaIdParam;
          this.categoriaNome = categoriaNomeParam || '';
          this.seletor.categoriaId = categoriaIdParam;
          this.buscarProdutos();
        } else {
          this.categoriaId = null;
          this.categoriaNome = '';
          this.seletor.categoriaId = null;
          this.buscarProdutos();
        }
      });
    });

    // Configurar o observador do searchSubject para realizar a busca após um tempo
    this.searchSubject.pipe(
      debounceTime(500), // Aguarda 500ms após o último evento
      distinctUntilChanged(), // Ignora se o valor não mudou
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Atualiza o seletor com os termos de busca
      this.seletor.codigoBarras = this.filtroCodigoBarras;
      this.seletor.descricao = this.filtroDescricao;
      this.seletor.marca = this.filtroMarca;
      this.seletor.unidadeMedida = this.filtroUnidadeMedida;
      this.seletor.fornecedorId = this.filtroFornecedor ? this.filtroFornecedor.id : null;
      this.seletor.pagina = 1;
      // Realiza a busca
      this.buscarProdutos();
    });
  }

  public buscarFornecedores() {
    return new Promise<void>((resolve) => {
      this.fornecedorService.listarTodos().subscribe(
        (resultado) => {
          this.fornecedores = resultado;
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
      this.categoriaService.buscarPorId(this.categoriaId).subscribe({
        next: (categoria) => {
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
      this.produtoService.listarPorCategoria(this.categoriaId.toString()).subscribe({
        next: (resultado) => {
          this.aplicarFiltrosLocalmente(resultado);
        },
        error: (erro) => {
          console.error('Error fetching products by category:', erro);
        }
      });
    } else {
      this.produtoService.listarTodos().subscribe({
        next: (resultado) => {
          this.aplicarFiltrosLocalmente(resultado);
        },
        error: (erro) => {
          console.error('Error fetching all products:', erro);
        }
      });
    }
  }

  private aplicarFiltrosLocalmente(produtos: Produto[]) {
    // Aplicar filtros
    let produtosFiltrados = produtos;
    
    if (this.seletor.codigoBarras) {
      produtosFiltrados = produtosFiltrados.filter(p => 
        p.codigoBarras?.toLowerCase().includes(this.seletor.codigoBarras.toLowerCase()));
    }
    
    if (this.seletor.descricao) {
      produtosFiltrados = produtosFiltrados.filter(p => 
        p.descricao?.toLowerCase().includes(this.seletor.descricao.toLowerCase()));
    }
    
    if (this.seletor.marca) {
      produtosFiltrados = produtosFiltrados.filter(p => 
        p.marca?.toLowerCase().includes(this.seletor.marca.toLowerCase()));
    }
    
    if (this.seletor.unidadeMedida) {
      produtosFiltrados = produtosFiltrados.filter(p => 
        p.unidadeMedida?.toLowerCase().includes(this.seletor.unidadeMedida.toLowerCase()));
    }
    
    if (this.seletor.fornecedorId) {
      produtosFiltrados = produtosFiltrados.filter(p => {
        // Verificar se o produto tem fornecedores
        if (!p.fornecedores || p.fornecedores.length === 0) {
          return false;
        }
        
        // Verificar se algum dos fornecedores do produto corresponde ao fornecedor selecionado
        return p.fornecedores.some(fornecedor => {
          // Se o fornecedor for um objeto, verificar o ID
          if (typeof fornecedor === 'object' && fornecedor !== null) {
            return Number(fornecedor.id) === Number(this.seletor.fornecedorId);
          }
          // Se o fornecedor for um número ou string, comparar diretamente
          return Number(fornecedor) === Number(this.seletor.fornecedorId);
        });
      });
    }
    
    // Calcular total de páginas
    this.totalPaginas = Math.ceil(produtosFiltrados.length / this.seletor.limite);
    
    // Aplicar paginação
    const inicio = (this.seletor.pagina - 1) * this.seletor.limite;
    const fim = inicio + this.seletor.limite;
    produtosFiltrados = produtosFiltrados.slice(inicio, fim);
    
    // Criar uma nova instância para cada produto e seus fornecedores
    this.produtos = produtosFiltrados.map(produto => {
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
  }

  public onSearchInput(): void {
    this.searchSubject.next(this.filtroCodigoBarras);
  }

  public alterarItensPorPagina() {
    this.seletor.limite = this.itensPorPagina;
    this.seletor.pagina = 1;
    this.buscarProdutos();
  }

  public toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public aplicarFiltros() {
    this.seletor.pagina = 1;

    this.seletor.codigoBarras = this.filtroCodigoBarras;
    this.seletor.descricao = this.filtroDescricao;
    this.seletor.marca = this.filtroMarca;
    this.seletor.unidadeMedida = this.filtroUnidadeMedida;
    this.seletor.fornecedorId = this.filtroFornecedor ? this.filtroFornecedor.id : null;

    this.buscarProdutos();

    this.mostrarFiltros = false;
  }

  public limparFiltros() {
    this.filtroCodigoBarras = '';
    this.filtroDescricao = '';
    this.filtroMarca = '';
    this.filtroUnidadeMedida = '';
    this.filtroFornecedor = null;

    this.seletor.codigoBarras = '';
    this.seletor.descricao = '';
    this.seletor.marca = '';
    this.seletor.unidadeMedida = '';
    this.seletor.fornecedorId = null;
    this.seletor.pagina = 1;

    this.buscarProdutos();
  }

  public voltarPagina(): void {
    if (this.seletor.pagina > 1) {
      this.seletor.pagina--;
      this.buscarProdutos();
    }
  }

  public avancarPagina(): void {
    if (this.seletor.pagina < this.totalPaginas) {
      this.seletor.pagina++;
      this.buscarProdutos();
    }
  }

  public irParaPagina(indicePagina: number): void {
    this.seletor.pagina = indicePagina;
    this.buscarProdutos();
  }

  public criarArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
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

          // Buscar todos os corredores para encontrar o que contém esta categoria
          this.corredorService.listarTodos().subscribe({
            next: (corredores) => {
              // Encontrar o corredor que contém esta categoria
              const corredorEncontrado = corredores.find(corredor => 
                corredor.categorias.some(cat => cat.id === categoriaId)
              );

              if (corredorEncontrado) {
                // Navegar para a edição com o ID da categoria e do corredor
                this.router.navigate(['/categoria-detalhe'], {
                  queryParams: {
                    id: categoriaId,
                    corredorId: corredorEncontrado.id
                  }
                });
              } else {
                Swal.fire('Erro', 'Não foi possível encontrar o corredor desta categoria', 'error');
              }
            },
            error: (erro) => {
              console.error('Erro ao buscar corredores:', erro);
              Swal.fire('Erro', 'Não foi possível carregar os corredores', 'error');
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

  public voltar(): void {
    this.router.navigate(['/corredor']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
}

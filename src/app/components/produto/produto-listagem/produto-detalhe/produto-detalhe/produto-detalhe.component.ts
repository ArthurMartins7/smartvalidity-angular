import { Component, OnInit } from '@angular/core';
import { Produto } from '../../../../../shared/model/entity/produto';
import { ProdutoService } from '../../../../../shared/service/produto.service';
import { FornecedorService } from '../../../../../shared/service/fornecedor.service';
import { CategoriaService } from '../../../../../shared/service/categoria.service';
import { Fornecedor } from '../../../../../shared/model/entity/fornecedor';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produto-detalhe',
  imports: [FormsModule, CommonModule],
  templateUrl: './produto-detalhe.component.html',
  styleUrl: './produto-detalhe.component.css'
})
export class ProdutoDetalheComponent implements OnInit {

  public produto: Produto = new Produto();
  public idProduto: string;
  public fornecedores: Fornecedor[] = [];
  public fornecedorSelecionado: string;
  public categoriaId: string | null = null;
  public categoriaNome: string = '';

  constructor(
    private produtoService: ProdutoService,
    private fornecedorService: FornecedorService,
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.carregarFornecedores();
    this.route.params.subscribe((params) => {
      this.idProduto = params['id'];
      if (this.idProduto) {
        this.buscarProduto();
      }
    });

    this.route.queryParams.subscribe(params => {
      this.categoriaId = params['categoriaId'] || null;
      this.categoriaNome = params['categoriaNome'] || '';

      if (this.categoriaId) {
        // If we have a category ID, create a basic category object
        this.produto.categoria = {
          id: this.categoriaId,
          nome: this.categoriaNome,
          corredor: { id: '' },
          produtos: []
        };
      }
    });
  }

  carregarFornecedores(): void {
    this.fornecedorService.listarTodos().subscribe(
      (fornecedores) => {
        this.fornecedores = fornecedores;
      },
      (erro) => {
        Swal.fire('Erro ao carregar fornecedores!', erro, 'error');
      }
    );
  }

  buscarProduto(): void {
    this.produtoService.buscarPorId(this.idProduto).subscribe(
      (produto) => {
        this.produto = produto;
        this.fornecedorSelecionado = produto.fornecedores?.[0]?.id;
      },
      (erro) => {
        Swal.fire('Erro ao buscar o produto!', erro, 'error');
      }
    );
  }

  salvar(event: Event): void {
    event.preventDefault();

    // Cria um objeto simplificado do produto para enviar ao backend
    const produtoParaSalvar = {
      codigoBarras: this.produto.codigoBarras,
      descricao: this.produto.descricao,
      marca: this.produto.marca,
      unidadeMedida: this.produto.unidadeMedida,
      quantidade: this.produto.quantidade,
      fornecedores: [] as any[],
      categoria: null as any
    };

    // Adiciona o fornecedor se selecionado
    if (this.fornecedorSelecionado) {
      produtoParaSalvar.fornecedores = [{
        id: this.fornecedorSelecionado
      }];
    }

    // Adiciona a categoria se existir
    if (this.categoriaId) {
      produtoParaSalvar.categoria = {
        id: this.categoriaId
      };
    }

    console.log('Dados do produto antes de salvar:', JSON.stringify(produtoParaSalvar, null, 2));

    if (this.idProduto) {
      this.atualizar(produtoParaSalvar);
    } else {
      this.inserir(produtoParaSalvar);
    }
  }

  inserir(produtoParaSalvar: any): void {
    console.log('Criando produto com os dados:', JSON.stringify(produtoParaSalvar, null, 2));
    this.produtoService.criarProduto(produtoParaSalvar).subscribe({
      next: (response) => {
        console.log('Produto criado com sucesso:', response);
        Swal.fire('Produto salvo com sucesso!', '', 'success');
        this.voltar();
      },
      error: (erro) => {
        console.error('Erro ao criar produto:', erro);
        console.error('Detalhes do erro:', JSON.stringify(erro, null, 2));
        Swal.fire('Erro ao salvar o produto', erro.error?.mensagem || 'Erro desconhecido', 'error');
      }
    });
  }

  atualizar(produtoParaSalvar: any): void {
    this.produtoService.atualizarProduto(this.idProduto, produtoParaSalvar).subscribe(
      () => {
        Swal.fire('Produto atualizado com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao atualizar o produto: ' + erro.error, 'error');
      }
    );
  }

  voltar(): void {
    if (this.categoriaId) {
      this.router.navigate(['/produto-listagem'], { 
        queryParams: { 
          categoriaId: this.categoriaId,
          categoriaNome: this.categoriaNome 
        } 
      });
    } else {
      this.router.navigate(['/produto-listagem']);
    }
  }
}

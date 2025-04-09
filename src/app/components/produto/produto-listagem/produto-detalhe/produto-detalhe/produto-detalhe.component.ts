import { Component, OnInit } from '@angular/core';
import { Produto } from '../../../../../shared/model/entity/produto';
import { ProdutoService } from '../../../../../shared/service/produto.service';
import { FornecedorService } from '../../../../../shared/service/fornecedor.service';
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
  public idProduto: number;
  public fornecedores: Fornecedor[] = [];
  public fornecedorSelecionado: number;

  constructor(
    private produtoService: ProdutoService,
    private fornecedorService: FornecedorService,
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

    if (this.fornecedorSelecionado) {
      const fornecedorSelecionado = this.fornecedores.find(f => f.id === this.fornecedorSelecionado);
      if (fornecedorSelecionado) {
        this.produto.fornecedores = [fornecedorSelecionado];
      }
    }

    if (this.idProduto) {
      this.atualizar();
    } else {
      this.inserir();
    }
  }

  inserir(): void {
    this.produtoService.criarProduto(this.produto).subscribe(
      () => {
        Swal.fire('Produto salvo com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao salvar o produto: ' + erro.error, 'error');
      }
    );
  }

  atualizar(): void {
    this.produtoService.atualizarProduto(this.idProduto, this.produto).subscribe(
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
    this.router.navigate(['/produto-listagem']);
  }
}

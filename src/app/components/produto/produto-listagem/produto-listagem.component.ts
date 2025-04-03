import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../shared/service/fornecedor.service';
import { Router } from '@angular/router';
import { Fornecedor } from '../../../shared/model/entity/fornecedor';
import { Produto } from '../../../shared/model/entity/produto';
import { ProdutoService } from '../../../shared/service/produto.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-produto-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './produto-listagem.component.html',
  styleUrl: './produto-listagem.component.css'
})
export class ProdutoListagemComponent implements OnInit{

  ngOnInit(): void {
    this.buscarProdutos();
  }

  private fornecedorService = inject(FornecedorService);
  private produtoService = inject(ProdutoService);
  private router = inject(Router);


  public Produto = new Produto();
  public produtos: Produto[] = [];
  public Fornecedor = new Fornecedor();
  public fornecedores: Fornecedor[] = [];

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

  public buscarProdutos() {
    this.produtoService.listarTodos().subscribe(
      (resultado) => {
        this.produtos = resultado;
        console.log(this.produtos);
      },
      (erro) => {
        console.error('Erro ao consultar todos os produtos', erro.error.mensagem);
      }
    );
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
    this.router.navigate(['produto-detalhe']);
  }
}

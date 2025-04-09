import { Component, OnInit } from '@angular/core';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { Router } from '@angular/router';
import { Fornecedor } from '../../../../shared/model/entity/fornecedor';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FornecedorSeletor } from '../../../../shared/model/seletor/fornecedor.seletor';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fornecedor-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './fornecedor-listagem.component.html',
  styleUrls: ['./fornecedor-listagem.component.css']
})
export class FornecedorListagemComponent implements OnInit {
  public seletor: FornecedorSeletor = new FornecedorSeletor();
  public fornecedores: Fornecedor[] = [];
  public totalPaginas: number = 0;
  public tamanhoPagina: number = 5;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public itensPorPagina: number = 5;

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;
    this.buscarFornecedores();
  }

  public buscarFornecedores(): void {
    this.fornecedorService.listarComSeletor(this.seletor).subscribe(
      (resultado) => {
        this.fornecedores = resultado;
        this.calcularTotalPaginas();
      },
      (erro) => {
        console.error('Erro ao consultar fornecedores', erro);
      }
    );
  }

  private calcularTotalPaginas(): void {
    this.fornecedorService.contarTotalRegistros(this.seletor).subscribe(
      (total) => {
        this.totalPaginas = Math.ceil(total / this.itensPorPagina);
      },
      (erro) => {
        console.error('Erro ao contar total de registros', erro);
      }
    );
  }

  public pesquisar() {
    this.seletor.pagina = 1; // Reseta para a primeira página ao pesquisar
    this.buscarFornecedores();
  }

  public excluir(fornecedorSelecionado: Fornecedor): void {
    Swal.fire({
      title: 'Deseja realmente excluir o fornecedor?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fornecedorService.excluirFornecedor(fornecedorSelecionado.id).subscribe(
          () => {
            this.fornecedores = this.fornecedores.filter(f => f.id !== fornecedorSelecionado.id);
            this.calcularTotalPaginas();
            Swal.fire('Excluído!', 'O fornecedor foi removido com sucesso.', 'success');
          },
          (erro) => {
            Swal.fire('Erro!', 'Não foi possível excluir o fornecedor.', 'error');
          }
        );
      }
    });
  }

  public editar(fornecedorSelecionado: Fornecedor): void {
    this.router.navigate(['/fornecedor-editar', fornecedorSelecionado.id]);
  }

  public adicionarFornecedor(): void {
    this.router.navigate(['fornecedor-detalhe']);
  }

  public voltarPagina(): void {
    if (this.seletor.pagina > 1) {
      this.seletor.pagina--;
      this.buscarFornecedores();
    }
  }

  public avancarPagina(): void {
    if (this.seletor.pagina < this.totalPaginas) {
      this.seletor.pagina++;
      this.buscarFornecedores();
    }
  }

  public irParaPagina(indicePagina: number): void {
    this.seletor.pagina = indicePagina;
    this.buscarFornecedores();
  }

  public criarArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  public alterarItensPorPagina() {
    this.seletor.limite = this.itensPorPagina;
    this.seletor.pagina = 1; // Volta para a primeira página
    this.buscarFornecedores();
  }
}

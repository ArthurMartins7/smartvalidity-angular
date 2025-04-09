import { Component, OnInit, OnDestroy } from '@angular/core';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { Router } from '@angular/router';
import { Fornecedor } from '../../../../shared/model/entity/fornecedor';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FornecedorSeletor } from '../../../../shared/model/seletor/fornecedor.seletor';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-fornecedor-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './fornecedor-listagem.component.html',
  styleUrls: ['./fornecedor-listagem.component.css']
})
export class FornecedorListagemComponent implements OnInit, OnDestroy {
  public seletor: FornecedorSeletor = new FornecedorSeletor();
  public fornecedores: Fornecedor[] = [];
  public totalPaginas: number = 0;
  public tamanhoPagina: number = 5;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public itensPorPagina: number = 5;
  public mostrarFiltros: boolean = false;
  public filtroTelefone: string = '';
  public filtroCnpj: string = '';
  public filtroDescricaoProduto: string = '';
  private searchSubject = new Subject<string>();

  constructor(
    private fornecedorService: FornecedorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;
    this.buscarFornecedores();

    // Configurar o debounce para a busca em tempo real
    this.searchSubject.pipe(
      debounceTime(300), // Aguarda 300ms após a última digitação
      distinctUntilChanged() // Só emite se o valor for diferente do anterior
    ).subscribe(() => {
      this.buscarFornecedores();
    });
  }

  public onSearchInput(): void {
    this.seletor.pagina = 1;
    this.searchSubject.next(this.seletor.nome);
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

  public toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public aplicarFiltros() {
    this.seletor.telefone = this.filtroTelefone;
    this.seletor.cnpj = this.filtroCnpj;
    this.seletor.descricaoProduto = this.filtroDescricaoProduto;
    this.seletor.pagina = 1;
    this.buscarFornecedores();
    this.mostrarFiltros = false;
  }

  public limparFiltros() {
    this.filtroTelefone = '';
    this.filtroCnpj = '';
    this.filtroDescricaoProduto = '';
    this.seletor.telefone = '';
    this.seletor.cnpj = '';
    this.seletor.descricaoProduto = '';
    this.seletor.pagina = 1;
    this.buscarFornecedores();
    this.mostrarFiltros = false;
  }

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}

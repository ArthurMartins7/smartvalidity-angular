import { Component, inject, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Corredor } from '../../../shared/model/entity/corredor';
import { CategoriaService } from '../../../shared/service/categoria.service';
import { CorredorService } from '../../../shared/service/corredor.service';
import { Categoria } from '../../../shared/model/entity/categoria';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CorredorSeletor } from '../../../shared/model/seletor/corredor.seletor';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutService } from '../../../shared/service/layout.service';

@Component({
  selector: 'app-corredor-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './corredor-listagem.component.html',
  styleUrl: './corredor-listagem.component.css'
})
export class CorredorListagemComponent implements OnInit, OnDestroy {
  private categoriaService = inject(CategoriaService);
  private corredorService = inject(CorredorService);
  private router = inject(Router);
  private layoutService = inject(LayoutService);
  private destroy$ = new Subject<void>();

  @HostBinding('class.sidebar-closed') sidebarClosed = false;

  public seletor: CorredorSeletor = new CorredorSeletor();
  public corredores: Corredor[] = [];
  public totalPaginas: number = 0;
  public tamanhoPagina: number = 5;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public itensPorPagina: number = 10;
  public mostrarFiltros: boolean = false;
  public filtroResponsavel: Usuario | null = null;
  public responsaveis: Usuario[] = [];
  private searchSubject = new Subject<string>();
  public filtroNome: string = '';

  ngOnInit(): void {
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;

    // Configurar o observador do searchSubject para realizar a busca após um tempo
    this.searchSubject.pipe(
      debounceTime(500), // Aguarda 500ms após o último evento
      distinctUntilChanged(), // Ignora se o valor não mudou
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      // Atualiza o seletor com o termo de busca
      this.seletor.nome = termo;
      // Realiza a busca
      this.buscarCorredores();
    });

    this.buscarCorredores();
    this.buscarResponsaveis();

    // Inscrever-se nas mudanças do estado do sidebar
    this.layoutService.sidebarState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isOpen: boolean) => {
      this.sidebarClosed = !isOpen;
    });
  }

  private buscarResponsaveis(): void {
    this.corredorService.listarResponsaveis().subscribe(
      (resultado) => {
        this.responsaveis = resultado;
      },
      (erro) => {
        console.error('Erro ao buscar responsáveis', erro);
        Swal.fire('Erro!', 'Não foi possível carregar os responsáveis.', 'error');
      }
    );
  }

  public onSearchInput(): void {
    this.seletor.pagina = 1;
    this.searchSubject.next(this.seletor.nome);
  }

  public buscarCorredores() {
    console.log('Buscando corredores com seletor:', {
      nome: this.seletor.nome,
      responsavel: this.seletor.responsavel,
      responsavelId: this.seletor.responsavelId,
      pagina: this.seletor.pagina,
      limite: this.seletor.limite
    });

    this.corredorService.listarComSeletor(this.seletor).subscribe(
      (resultado) => {
        console.log('Resultado da busca:', {
          quantidadeCorredores: resultado.length,
          corredores: resultado.map(c => ({
            id: c.id,
            nome: c.nome,
            responsaveis: c.responsaveis
          }))
        });
        this.corredores = resultado;
        this.calcularTotalPaginas();
      },
      (erro) => {
        console.error('Erro ao consultar corredores:', erro);
        Swal.fire('Erro!', 'Não foi possível carregar os corredores.', 'error');
      }
    );
  }

  private calcularTotalPaginas(): void {
    this.corredorService.contarTotalRegistros(this.seletor).subscribe({
      next: (total) => {
        console.log('Total de registros:', total);
        this.totalPaginas = Math.ceil(total / this.itensPorPagina);
        console.log('Total de páginas:', this.totalPaginas);
      },
      error: (erro) => {
        console.error('Erro ao contar total de registros:', erro);
        // Se houver erro, assume que há apenas uma página
        this.totalPaginas = 1;
        // Mostra uma mensagem de erro para o usuário
        Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar paginação',
          text: 'Não foi possível carregar o total de registros. A paginação pode estar incorreta.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  public alterarItensPorPagina() {
    this.seletor.limite = this.itensPorPagina;
    this.seletor.pagina = 1;
    this.buscarCorredores();
  }

  public toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public aplicarFiltros() {
    console.log('Aplicando filtros...');
    console.log('Responsável selecionado:', this.filtroResponsavel);

    // Resetar para a primeira página ao aplicar filtros
    this.seletor.pagina = 1;

    // Atualizar o seletor com os filtros
    this.seletor.nome = this.filtroNome;

    // Limpar os filtros de responsável se não houver seleção
    if (!this.filtroResponsavel) {
      this.seletor.responsavel = '';
      this.seletor.responsavelId = null;
    } else {
      // Atualizar com o responsável selecionado
      this.seletor.responsavel = this.filtroResponsavel.nome;
      this.seletor.responsavelId = this.filtroResponsavel.id;
    }

    console.log('Seletor atualizado:', {
      nome: this.seletor.nome,
      responsavel: this.seletor.responsavel,
      responsavelId: this.seletor.responsavelId,
      pagina: this.seletor.pagina,
      limite: this.seletor.limite
    });

    // Buscar corredores com os novos filtros
    this.buscarCorredores();

    // Fechar o modal de filtros após aplicar
    this.mostrarFiltros = false;
  }

  public limparFiltros() {
    this.filtroNome = '';
    this.filtroResponsavel = null;
    this.seletor.nome = '';
    this.seletor.responsavel = '';
    this.seletor.responsavelId = null;
    this.seletor.pagina = 1;
    this.buscarCorredores();
  }

  public voltarPagina(): void {
    if (this.seletor.pagina > 1) {
      this.seletor.pagina--;
      this.buscarCorredores();
    }
  }

  public avancarPagina(): void {
    if (this.seletor.pagina < this.totalPaginas) {
      this.seletor.pagina++;
      this.buscarCorredores();
    }
  }

  public irParaPagina(indicePagina: number): void {
    this.seletor.pagina = indicePagina;
    this.buscarCorredores();
  }

  public criarArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  excluir(corredorSelecionado: Corredor) {
    Swal.fire({
      title: 'Deseja realmente excluir o corredor ' + '"'+corredorSelecionado.nome+'"' + ' ?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.corredorService.excluirCorredor(corredorSelecionado.id).subscribe(
          () => {
            this.corredores = this.corredores.filter(c => c.id !== corredorSelecionado.id);
            this.calcularTotalPaginas();
            Swal.fire('Excluído!', 'O corredor foi removido com sucesso.', 'success');
          },
          erro => {
            Swal.fire({
              title: 'Erro ao excluir corredor',
              text: 'Não é possivel excluir o corredor pois possui uma categoria associada!',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }

  exibirImagemGrande(imagemBase64: string) {
    Swal.fire({
      title: 'Imagem da Carta',
      html: `<img src="data:image/jpeg;base64,${imagemBase64}" alt="Imagem da Carta" style="max-width: 100%; height: auto;">`,
      width: '80%',
      showCloseButton: true,
      showConfirmButton: false,
      background: '#fff',
      padding: '20px'
    });
  }


  editar(corredorSelecionado: Corredor) {
    this.router.navigate(['/corredor-editar/', corredorSelecionado.id]);
  }

  public adicionarCorredor() {
    this.router.navigate(['corredor-detalhe']);
  }

  public adicionarCategoria(corredor: Corredor) {
    this.router.navigate(['/categoria-detalhe'], { queryParams: { corredorId: corredor.id } });
  }

  public irParaProdutoListagem(categoriaId: string, categoriaNome: string) {
    this.router.navigate(['/produto-listagem'], {
      queryParams: {
        categoriaId,
        categoriaNome
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
}

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { Produto } from '../../../shared/model/entity/produto';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { AlertaSeletor } from '../../../shared/model/seletor/alerta.seletor';
import { AlertaService } from '../../../shared/service/alerta.service';
import { ProdutoService } from '../../../shared/service/produto.service';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-alerta-listagem',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './alerta-listagem.component.html',
  styleUrl: './alerta-listagem.component.css'
})
export class AlertaListagemComponent implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private produtoService = inject(ProdutoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  public seletor: AlertaSeletor = new AlertaSeletor();
  public alertas: AlertaDTO.Listagem[] = [];
  public produtos: Produto[] = [];
  public usuarios: Usuario[] = [];

  // Propriedades para paginação
  public totalPaginas: number = 0;
  public tamanhoPagina: number = 10;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public itensPorPagina: number = 10;

  // Propriedades para filtros
  public mostrarFiltros: boolean = false;
  public filtroTitulo: string = '';
  public filtroTipo: TipoAlerta | null = null;
  public filtroAtivo: boolean | null = null;
  public filtroProduto: Produto | null = null;
  public filtroUsuario: Usuario | null = null;
  public filtroDataInicio: string = '';
  public filtroDataFim: string = '';

  private searchSubject = new Subject<string>();

  // Enums para template
  public TipoAlerta = TipoAlerta;
  public tiposAlerta = Object.values(TipoAlerta);

  ngOnInit(): void {
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;

    // Configurar observador de busca
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      this.seletor.titulo = termo;
      this.seletor.pagina = 1;
      this.buscarAlertas();
    });

    this.buscarAlertas();
    this.carregarProdutos();
    this.carregarUsuarios();
  }

  public onSearchInput(): void {
    this.searchSubject.next(this.filtroTitulo);
  }

  public buscarAlertas(): void {
    this.alertaService.buscarComFiltros(this.seletor).subscribe({
      next: (resultado) => {
        this.alertas = resultado;
        this.calcularTotalPaginas();
      },
      error: (erro) => {
        console.error('Erro ao buscar alertas:', erro);
        // Só exibe erro se não for um erro 404 (sem alertas) ou similar
        if (erro.status !== 404 && erro.status !== 204) {
          Swal.fire('Erro!', 'Não foi possível carregar os alertas.', 'error');
        }
        // Se for 404 ou 204, apenas define lista vazia
        this.alertas = [];
      }
    });
  }

  private calcularTotalPaginas(): void {
    this.alertaService.contarTotalRegistros(this.seletor).subscribe({
      next: (total) => {
        this.totalPaginas = Math.ceil(total / this.itensPorPagina);
        if (this.totalPaginas === 0) this.totalPaginas = 1;
      },
      error: (erro) => {
        console.error('Erro ao obter total de alertas:', erro);
        this.totalPaginas = 1;
      }
    });
  }

  private carregarProdutos(): void {
    this.produtoService.listarTodos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
      }
    });
  }

  private carregarUsuarios(): void {
    this.usuarioService.buscarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (erro) => {
        console.error('Erro ao carregar usuários:', erro);
      }
    });
  }

  public alterarItensPorPagina(): void {
    this.seletor.limite = this.itensPorPagina;
    this.seletor.pagina = 1;
    this.buscarAlertas();
  }

  public toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  public aplicarFiltros(): void {
    this.seletor.pagina = 1;
    this.seletor.titulo = this.filtroTitulo || undefined;
    this.seletor.tipo = this.filtroTipo || undefined;
    this.seletor.ativo = this.filtroAtivo ?? undefined;
    this.seletor.usuarioCriador = this.filtroUsuario?.nome || undefined;

    if (this.filtroDataInicio) {
      this.seletor.dataInicialDisparo = new Date(this.filtroDataInicio);
    } else {
      this.seletor.dataInicialDisparo = undefined;
    }

    if (this.filtroDataFim) {
      this.seletor.dataFinalDisparo = new Date(this.filtroDataFim);
    } else {
      this.seletor.dataFinalDisparo = undefined;
    }

    this.buscarAlertas();
    this.mostrarFiltros = false;
  }

  public limparFiltros(): void {
    this.filtroTitulo = '';
    this.filtroTipo = null;
    this.filtroAtivo = null;
    this.filtroProduto = null;
    this.filtroUsuario = null;
    this.filtroDataInicio = '';
    this.filtroDataFim = '';

    this.seletor = new AlertaSeletor();
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;

    this.buscarAlertas();
  }

  public voltarPagina(): void {
    if (this.seletor.pagina > 1) {
      this.seletor.pagina--;
      this.buscarAlertas();
    }
  }

  public avancarPagina(): void {
    if (this.seletor.pagina < this.totalPaginas) {
      this.seletor.pagina++;
      this.buscarAlertas();
    }
  }

  public irParaPagina(indicePagina: number): void {
    this.seletor.pagina = indicePagina;
    this.buscarAlertas();
  }

  public criarArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  public adicionarAlerta(): void {
    this.router.navigate(['/alerta-editar']);
  }

  public editarAlerta(alerta: AlertaDTO.Listagem): void {
    // Verificar se é um alerta editável
    if (alerta.tipo !== TipoAlerta.PERSONALIZADO) {
      Swal.fire({
        title: 'Alerta Automático',
        text: 'Alertas automáticos não podem ser editados. Apenas alertas personalizados são editáveis.',
        icon: 'info',
        confirmButtonText: 'Entendi'
      });
      return;
    }

    this.router.navigate(['/alerta-editar', alerta.id]);
  }

  public visualizarAlerta(alerta: AlertaDTO.Listagem): void {
    this.router.navigate(['/alerta-detalhe', alerta.id]);
  }

  public toggleAtivoAlerta(alerta: AlertaDTO.Listagem): void {
    this.alertaService.toggleAtivo(alerta.id).subscribe({
      next: (alertaAtualizado) => {
        const index = this.alertas.findIndex(a => a.id === alerta.id);
        if (index !== -1) {
          this.alertas[index] = alertaAtualizado;
        }
        Swal.fire('Sucesso!',
          `Alerta ${alertaAtualizado.ativo ? 'ativado' : 'desativado'} com sucesso.`,
          'success');
      },
      error: (erro) => {
        console.error('Erro ao alterar status do alerta:', erro);
        Swal.fire('Erro!', 'Não foi possível alterar o status do alerta.', 'error');
      }
    });
  }

  public excluirAlerta(alerta: AlertaDTO.Listagem): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir o alerta "${alerta.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.alertaService.excluirAlerta(alerta.id).subscribe({
          next: () => {
            this.alertas = this.alertas.filter(a => a.id !== alerta.id);
            Swal.fire('Excluído!', 'Alerta excluído com sucesso.', 'success');
          },
          error: (erro) => {
            console.error('Erro ao excluir alerta:', erro);
            Swal.fire('Erro!', 'Não foi possível excluir o alerta.', 'error');
          }
        });
      }
    });
  }

  public formatarData(data: Date): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  public formatarDataHora(data: Date): string {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR');
  }

  public obterDescricaoTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_HOJE:
        return 'Vencimento Hoje';
      case TipoAlerta.VENCIMENTO_AMANHA:
        return 'Vencimento Amanhã';
      case TipoAlerta.VENCIMENTO_ATRASO:
        return 'Vencimento em Atraso';
      case TipoAlerta.PERSONALIZADO:
        return 'Personalizado';
      default:
        return tipo;
    }
  }

  public obterCorTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_HOJE:
        return 'bg-orange-100 text-orange-800';
      case TipoAlerta.VENCIMENTO_AMANHA:
        return 'bg-yellow-100 text-yellow-800';
      case TipoAlerta.VENCIMENTO_ATRASO:
        return 'bg-red-100 text-red-800';
      case TipoAlerta.PERSONALIZADO:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  public trackByAlerta(index: number, alerta: AlertaDTO.Listagem): number {
    return alerta.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

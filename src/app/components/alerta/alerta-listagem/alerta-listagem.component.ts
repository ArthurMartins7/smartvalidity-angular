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
import { NotificacaoService } from '../../../shared/service/notificacao.service';
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
  private notificacaoService = inject(NotificacaoService);
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

  // Propriedades para busca
  public buscando: boolean = false;
  public ultimaBusca: string = '';

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
    // Se o usuário limpar o campo, reseta a busca
    if (!this.filtroTitulo) {
      this.limparFiltros();
      return;
    }
    this.searchSubject.next(this.filtroTitulo);
  }

  public realizarPesquisa(): void {
    if (!this.filtroTitulo || this.filtroTitulo.trim() === '') {
      this.limparFiltros();
      return;
    }

    this.buscando = true;
    this.ultimaBusca = this.filtroTitulo;

    // Reset selector search parameters
    this.seletor = new AlertaSeletor();
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;
    this.seletor.titulo = this.filtroTitulo.trim();

    this.buscarAlertas();
  }

  public buscarAlertas(): void {
    this.alertaService.buscarComFiltros(this.seletor).subscribe({
      next: (resultado) => {
        this.alertas = resultado;
        this.calcularTotalPaginas();
        this.buscando = false;

        // Feedback se a busca não retornou resultados
        if (this.alertas.length === 0 && this.ultimaBusca) {
          Swal.fire({
            title: 'Nenhum resultado encontrado',
            text: `Não foram encontrados alertas para a busca "${this.ultimaBusca}"`,
            icon: 'info',
            confirmButtonText: 'Ok',
            confirmButtonColor: '#5084C1'
          });
        }
      },
      error: (erro) => {
        console.error('Erro ao buscar alertas:', erro);
        this.buscando = false;

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
    this.ultimaBusca = '';

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

  public irParaPaginaSegura(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.irParaPagina(pagina);
    }
  }

  public criarArrayPaginas(): (number | string)[] {
    const paginaAtual = this.seletor.pagina;
    const totalPaginas = this.totalPaginas;
    const paginas: (number | string)[] = [];

    // Se tiver 4 páginas ou menos, mostra todas
    if (totalPaginas <= 4) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    // Para mais de 4 páginas, mostra no máximo 4 elementos
    if (paginaAtual <= 2) {
      // Páginas iniciais: [1] [2] [3] ...
      paginas.push(1, 2, 3, '...');
    } else if (paginaAtual >= totalPaginas - 1) {
      // Páginas finais: ... [n-2] [n-1] [n]
      paginas.push('...', totalPaginas - 2, totalPaginas - 1, totalPaginas);
    } else {
      // Páginas do meio: [1] ... [atual] [atual+1]
      paginas.push(1, '...', paginaAtual, paginaAtual + 1);
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

  /**
   * Alterna o status ativo/inativo do alerta
   */
  public toggleAtivoAlerta(alerta: AlertaDTO.Listagem): void {
    this.alertaService.toggleAtivo(alerta.id).subscribe({
      next: (alertaAtualizado) => {
        // Atualizar o item específico na lista e forçar detecção de mudanças
        const index = this.alertas.findIndex(a => a.id === alerta.id);
        if (index !== -1) {
          // Criar uma nova instância do array para forçar detecção de mudanças
          this.alertas = [...this.alertas];
          this.alertas[index] = { ...alertaAtualizado };
        }

        const statusTexto = alertaAtualizado.ativo ? 'ativado' : 'desativado';
        Swal.fire({
          title: 'Sucesso!',
          text: `Alerta ${statusTexto} com sucesso!`,
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      },
      error: (erro) => {
        console.error('Erro ao atualizar status do alerta:', erro);
        Swal.fire('Erro!', 'Não foi possível atualizar o status do alerta.', 'error');
      }
    });
  }

  public formatarDataHora(data: Date): string {
    if (!data) return '-';
    return this.notificacaoService.formatarDataHora(data);
  }

  public obterDescricaoTipo(tipo: TipoAlerta): string {
    return this.notificacaoService.obterDescricaoTipo(tipo);
  }

  public obterCorTipo(tipo: TipoAlerta): string {
    return this.notificacaoService.obterCorTipo(tipo);
  }

  public removerEmojis(titulo: string): string {
    return this.notificacaoService.removerEmojis(titulo);
  }

  public trackByAlerta(index: number, alerta: AlertaDTO.Listagem): number {
    return alerta.id;
  }

  public excluirAlerta(alerta: AlertaDTO.Listagem): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir o alerta "${this.removerEmojis(alerta.titulo)}"?`,
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

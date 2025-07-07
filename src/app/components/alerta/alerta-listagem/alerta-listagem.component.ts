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

  public totalPaginas: number = 0;
  public tamanhoPagina: number = 10;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public itensPorPagina: number = 10;

  public mostrarFiltros: boolean = false;
  public filtroTitulo: string = '';
  public filtroTipo: TipoAlerta | null = null;
  public filtroProduto: Produto | null = null;
  public filtroUsuario: Usuario | null = null;
  public filtroDataInicio: string = '';
  public filtroDataFim: string = '';

  public buscando: boolean = false;
  public loading: boolean = false;
  public ultimaBusca: string = '';

  public activeTab: 'ativos' | 'personalizados' | 'jaResolvidos' = 'ativos';

  private searchSubject = new Subject<string>();

  public TipoAlerta = TipoAlerta;
  public tiposAlerta = Object.values(TipoAlerta);

  ngOnInit(): void {
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      this.seletor.titulo = termo;
      this.seletor.pagina = 1;
      this.buscarAlertas();
    });

    this.loading = true;
    this.buscarAlertas();
    this.carregarProdutos();
    this.carregarUsuarios();
  }

  public onSearchInput(): void {

    if (!this.filtroTitulo) {
      this.limparFiltros();
      return;
    }

    // Só faz busca se tem pelo menos 3 caracteres
    if (this.filtroTitulo.trim().length >= 3) {
      this.searchSubject.next(this.filtroTitulo);
    } else {
      // Se tem menos de 3 caracteres, limpa os resultados filtrados
      this.searchSubject.next('');
    }
  }

  public realizarPesquisa(): void {
    if (!this.filtroTitulo || this.filtroTitulo.trim() === '') {
      this.limparFiltros();
      return;
    }

    // Só faz busca se tem pelo menos 3 caracteres
    if (this.filtroTitulo.trim().length < 3) {
      return;
    }

    this.buscando = true;
    this.ultimaBusca = this.filtroTitulo;
    this.seletor = new AlertaSeletor();
    this.seletor.pagina = 1;
    this.seletor.limite = this.itensPorPagina;
    this.seletor.titulo = this.filtroTitulo.trim();

    this.buscarAlertas();
  }

  public buscarAlertas(): void {
    this.loading = true;

    let observable;

    switch (this.activeTab) {
      case 'ativos':
        observable = this.alertaService.buscarAlertasAtivos();
        break;
      case 'personalizados':
        observable = this.alertaService.buscarAlertasPersonalizados();
        break;
      case 'jaResolvidos':
        observable = this.alertaService.buscarAlertasJaResolvidos();
        break;
      default:
        observable = this.alertaService.buscarComFiltros(this.seletor);
        break;
    }

    observable.subscribe({
      next: (resultado) => {
        this.alertas = resultado;
        this.calcularTotalPaginas();
        this.buscando = false;
        this.loading = false;

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
        this.loading = false;

        if (erro.status !== 404 && erro.status !== 204) {
          Swal.fire('Erro!', 'Não foi possível carregar os alertas.', 'error');
        }
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

  public irParaPaginaSegura(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.irParaPagina(pagina);
    }
  }

  public criarArrayPaginas(): (number | string)[] {
    const paginaAtual = this.seletor.pagina;
    const totalPaginas = this.totalPaginas;
    const paginas: (number | string)[] = [];

    if (totalPaginas <= 4) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
      return paginas;
    }

    if (paginaAtual <= 2) {

      paginas.push(1, 2, 3, '...');
    } else if (paginaAtual >= totalPaginas - 1) {

      paginas.push('...', totalPaginas - 2, totalPaginas - 1, totalPaginas);
    } else {

      paginas.push(1, '...', paginaAtual, paginaAtual + 1);
    }

    return paginas;
  }

  public adicionarAlerta(): void {
    this.router.navigate(['/alerta-editar']);
  }

  public editarAlerta(alerta: AlertaDTO.Listagem): void {

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

  public obterPrioridadeAlerta(alerta: AlertaDTO.Listagem): 'alta' | 'media' | 'baixa' | 'normal' {
    // Vencimentos atrasados têm prioridade alta
    if (alerta.tipo === TipoAlerta.VENCIMENTO_ATRASO) {
      return 'alta';
    }

    // Vencimentos hoje têm prioridade média
    if (alerta.tipo === TipoAlerta.VENCIMENTO_HOJE) {
      return 'media';
    }

    // Vencimentos amanhã têm prioridade baixa
    if (alerta.tipo === TipoAlerta.VENCIMENTO_AMANHA) {
      return 'baixa';
    }

    return 'normal';
  }

  /**
   * Obtém a cor do indicador de prioridade baseado no tipo do alerta
   */
  public obterCorIndicadorPrioridade(alerta: AlertaDTO.Listagem): string {
    switch (alerta.tipo) {
      case TipoAlerta.VENCIMENTO_ATRASO:
        return 'bg-red-500';
      case TipoAlerta.VENCIMENTO_HOJE:
        return 'bg-orange-500';
      case TipoAlerta.VENCIMENTO_AMANHA:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  }

  /**
   * Obtém o título do indicador de prioridade
   */
  public obterTituloIndicadorPrioridade(alerta: AlertaDTO.Listagem): string {
    switch (alerta.tipo) {
      case TipoAlerta.VENCIMENTO_ATRASO:
        return 'Produto vencido - Alta prioridade';
      case TipoAlerta.VENCIMENTO_HOJE:
        return 'Produto vence hoje - Média prioridade';
      case TipoAlerta.VENCIMENTO_AMANHA:
        return 'Produto vence amanhã - Baixa prioridade';
      default:
        return 'Prioridade normal';
    }
  }

  public isUrgente(alerta: AlertaDTO.Listagem): boolean {

    return alerta.tipo === TipoAlerta.VENCIMENTO_ATRASO;
  }

  public isProximoVencimento(alerta: AlertaDTO.Listagem): boolean {

    return alerta.tipo === TipoAlerta.VENCIMENTO_HOJE || alerta.tipo === TipoAlerta.VENCIMENTO_AMANHA;
  }

  public calcularDiasParaVencimento(alerta: AlertaDTO.Listagem): number {

    switch (alerta.tipo) {
      case TipoAlerta.VENCIMENTO_HOJE:
        return 0;
      case TipoAlerta.VENCIMENTO_AMANHA:
        return 1;
      case TipoAlerta.VENCIMENTO_ATRASO:
        // Calcula quantos dias em atraso
        const hoje = new Date();
        const dataDisparo = new Date(alerta.dataHoraDisparo);
        const diffTime = hoje.getTime() - dataDisparo.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(diffDays, 1);
      default:
        return 0;
    }
  }

  /**
   * Obtém o texto do badge de dias vencidos
   */
  public obterTextoDiasVencidos(alerta: AlertaDTO.Listagem): string {
    if (alerta.diasVencidos === undefined || alerta.diasVencidos === null) {
      return '';
    }

    const dias = alerta.diasVencidos;

    if (dias < 0) {
      // Ainda não venceu
      const diasRestantes = Math.abs(dias);
      return diasRestantes === 1 ? 'vence amanhã' : `vence em ${diasRestantes} dias`;
    } else if (dias === 0) {
      // Vence hoje
      return 'vence hoje';
    } else {
      // Já venceu
      return dias === 1 ? 'venceu há 1 dia' : `venceu há ${dias} dias`;
    }
  }

  /**
   * Verifica se deve mostrar o badge de dias vencidos
   */
  public deveMostrarBadgeDias(alerta: AlertaDTO.Listagem): boolean {
    return alerta.tipo === TipoAlerta.VENCIMENTO_ATRASO &&
           alerta.diasVencidos !== undefined &&
           alerta.diasVencidos > 0;
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
            const msg = erro.error?.message || 'Não foi possível excluir o alerta.';
            Swal.fire('Aviso', msg, 'warning');
          }
        });
      }
    });
  }

  public setActiveTab(tab: 'ativos' | 'personalizados' | 'jaResolvidos'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.limparFiltros(); // Limpa filtros ao trocar de aba
      this.buscarAlertas();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

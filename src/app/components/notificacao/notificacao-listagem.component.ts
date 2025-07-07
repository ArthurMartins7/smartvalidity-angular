import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../shared/model/dto/alerta.dto';
import { TipoAlerta } from '../../shared/model/enum/tipo-alerta.enum';
import { NotificacaoService } from '../../shared/service/notificacao.service';

/**
 * Componente responsável pela listagem de notificações.
 *
 * RESPONSABILIDADES MVC (VIEW):
 * - Apresentar dados ao usuário
 * - Capturar interações do usuário
 * - Chamar métodos do Service para operações de negócio
 * - Não contém lógica de negócio complexa
 * - Foco na experiência do usuário e interface
 */
@Component({
  selector: 'app-notificacao-listagem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacao-listagem.component.html',
  styleUrl: './notificacao-listagem.component.css'
})
export class NotificacaoListagemComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notificacoes: AlertaDTO.Listagem[] = [];
  carregando: boolean = false;

  // Enums para template
  public TipoAlerta = TipoAlerta;

  public itensPorPagina: number = 10;
  public opcoesItensPorPagina: number[] = [5,10,15,20,25,50];
  public paginaAtual: number = 1;
  public activeTab: 'pendentes' | 'personalizadas' | 'jaResolvidas' = 'pendentes';

  // Campo de busca
  filtroTitulo: string = '';
  buscando: boolean = false;
  private searchSubject = new Subject<string>();

  public get notificacoesFiltradas(): AlertaDTO.Listagem[] {
    // Primeiro, filtra pela aba selecionada (pendentes, personalizadas ou já resolvidas)
    let lista: AlertaDTO.Listagem[];

    switch (this.activeTab) {
      case 'pendentes':
        lista = this.notificacoes;
        break;
      case 'personalizadas':
        lista = this.notificacoes;
        break;
      case 'jaResolvidas':
      default:
        lista = this.notificacoes;
        break;
    }

    // Em seguida, aplica filtro por título ou descrição, se houver termo de busca
    if (this.filtroTitulo && this.filtroTitulo.trim() !== '') {
      const termo = this.filtroTitulo.trim().toLowerCase();
      lista = lista.filter(n =>
        (this.removerEmojis(n.titulo).toLowerCase().includes(termo)) ||
        (n.descricao ? n.descricao.toLowerCase().includes(termo) : false)
      );
    }

    return lista;
  }

  public get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.notificacoesFiltradas.length / this.itensPorPagina));
  }

  constructor(
    private notificacaoService: NotificacaoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarNotificacoes();

    // Configurar observador de busca com debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(termo => {
      this.filtroTitulo = termo;
      this.paginaAtual = 1;
    });

    // Forçar atualização do contador ao entrar na página de notificações
    setTimeout(() => {
      this.notificacaoService.forcarAtualizacaoImediata();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carregar notificações do usuário
   */
  private carregarNotificacoes(): void {
    this.carregando = true;

    let observable;
    
    switch (this.activeTab) {
      case 'pendentes':
        observable = this.notificacaoService.buscarNotificacoesPendentes();
        break;
      case 'personalizadas':
        observable = this.notificacaoService.buscarNotificacoesPersonalizadas();
        break;
      case 'jaResolvidas':
      default:
        observable = this.notificacaoService.buscarNotificacoesJaResolvidas();
        break;
    }

    observable.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notificacoes) => {
          this.notificacoes = notificacoes || [];
          this.carregando = false;
        },
        error: (error) => {
          this.notificacoes = [];
          this.carregando = false;

          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
          } else {
            Swal.fire({
              title: 'Erro',
              text: 'Erro ao carregar notificações. Tente novamente.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
      });
  }

  /**
   * Navegar para o item no mural
   * Responsabilidade: VIEW - Coordena ações de navegação
   */
  public irParaMural(notificacao: AlertaDTO.Listagem): void {
    // Delega a lógica de mapeamento para o SERVICE
    const parametros = this.notificacaoService.gerarParametrosMuralBasico(notificacao.tipo);
    this.router.navigate(['/mural-listagem'], { queryParams: parametros });
  }

  /**
   * Ver detalhes da notificação
   */
  public verDetalhes(notificacao: AlertaDTO.Listagem): void {
    if (notificacao.id) {
      this.router.navigate(['/notificacao-detalhe', notificacao.id]);
    }
  }

  /**
   * Obter descrição do tipo de alerta
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public obterDescricaoTipo(tipo: TipoAlerta): string {
    return this.notificacaoService.obterDescricaoTipo(tipo);
  }

  /**
   * Obter cor do tipo de alerta
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public obterCorTipo(tipo: TipoAlerta): string {
    return this.notificacaoService.obterCorTipo(tipo);
  }

  /**
   * Formatar data/hora
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public formatarDataHora(data: Date): string {
    return this.notificacaoService.formatarDataHora(data);
  }

  /**
   * Voltar para página anterior
   * Responsabilidade: VIEW - Navegação
   */
  public voltar(): void {
    // Forçar atualização do contador antes de sair
    this.notificacaoService.forcarAtualizacaoImediata();
    this.router.navigate(['/mural-listagem']);
  }

  /**
   * Obter tempo relativo (ex: "há 2 horas")
   * Responsabilidade: VIEW - Delega cálculo para o SERVICE
   */
  public obterTempoRelativo(data: Date): string {
    return this.notificacaoService.obterTempoRelativo(data);
  }

  /**
   * Remove emojis do título da notificação para exibição
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public removerEmojis(titulo: string): string {
    return this.notificacaoService.removerEmojis(titulo);
  }

  /**
   * Track by function para ngFor
   */
  public trackByNotificacao(index: number, item: AlertaDTO.Listagem): any {
    return item.id;
  }

  public alterarItensPorPagina(valor: number): void {
    this.itensPorPagina = valor;
    this.paginaAtual = 1;
  }

  public voltarPagina(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }

  public avancarPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }

  public irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  public setActiveTab(tab: 'pendentes' | 'personalizadas' | 'jaResolvidas'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.paginaAtual = 1;
      // Remove o filtro antigo pois agora cada aba tem seu próprio endpoint
      this.carregarNotificacoes();
    }
  }

  /**
   * Excluir uma notificação
   */
  public excluirNotificacao(notificacao: AlertaDTO.Listagem): void {
    if (!notificacao.id) return;

    Swal.fire({
      title: 'Excluir notificação?',
      text: 'Esta ação removerá a notificação, mas não afetará o alerta associado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.notificacaoService.excluirNotificacao(notificacao.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              // Remover da lista local
              this.notificacoes = this.notificacoes.filter(n => n.id !== notificacao.id);

              Swal.fire({
                title: 'Excluída!',
                text: 'Notificação removida com sucesso.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (error) => {
              const msg = error.error?.message || 'Não foi possível excluir a notificação.';
              Swal.fire('Aviso', msg, 'warning');
            }
          });
      }
    });
  }

  /**
   * Handler para evento de digitação no campo de busca
   */
  public onSearchInput(): void {
    // Se campo vazio, limpa busca
    if (!this.filtroTitulo) {
      this.searchSubject.next('');
      return;
    }
    this.searchSubject.next(this.filtroTitulo);
  }

  /**
   * Classe de cor da borda lateral baseada no tipo de alerta
   */
  public obterClasseBordaTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_ATRASO:
        return 'border-l-red-500';
      case TipoAlerta.VENCIMENTO_HOJE:
        return 'border-l-orange-500';
      case TipoAlerta.VENCIMENTO_AMANHA:
        return 'border-l-yellow-500';
      case TipoAlerta.PERSONALIZADO:
      default:
        return 'border-l-blue-500';
    }
  }

  /**
   * Verifica se uma notificação está pendente (item não inspecionado)
   */
  public isPendente(notificacao: AlertaDTO.Listagem): boolean {
    return notificacao.itemInspecionado === false;
  }

  /**
   * Obtém o texto do badge de dias vencidos
   */
  public obterTextoDiasVencidos(notificacao: AlertaDTO.Listagem): string {
    if (notificacao.diasVencidos === undefined || notificacao.diasVencidos === null) {
      return '';
    }

    const dias = notificacao.diasVencidos;
    
    if (dias > 0) {
      // Já venceu - mostrar apenas "há X dias"
      return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
    }
    
    // Para produtos que não venceram, não mostrar badge
    return '';
  }

  /**
   * Verifica se deve mostrar o badge de dias vencidos
   */
  public deveMostrarBadgeDias(notificacao: AlertaDTO.Listagem): boolean {
    return notificacao.diasVencidos !== undefined && 
           notificacao.diasVencidos > 0;
  }

  /**
   * Verifica se a notificação é de um alerta personalizado
   */
  public ehAlertaPersonalizado(notificacao: AlertaDTO.Listagem): boolean {
    return notificacao.tipo === TipoAlerta.PERSONALIZADO;
  }
}

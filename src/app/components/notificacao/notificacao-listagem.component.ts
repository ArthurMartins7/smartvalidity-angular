import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  filtrarApenasNaoLidas: boolean = false;

  // Enums para template
  public TipoAlerta = TipoAlerta;

  public itensPorPagina: number = 10;
  public opcoesItensPorPagina: number[] = [5,10,15,20,25,50];
  public paginaAtual: number = 1;
  public activeTab: 'todas' | 'naoLidas' | 'lidas' = 'todas';

  public get notificacoesFiltradas(): AlertaDTO.Listagem[] {
    switch (this.activeTab) {
      case 'naoLidas':
        return this.notificacoes.filter(n => !n.lida);
      case 'lidas':
        return this.notificacoes.filter(n => n.lida);
      default:
        return this.notificacoes;
    }
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

    const observable = this.filtrarApenasNaoLidas
      ? this.notificacaoService.buscarNotificacoesNaoLidas()
      : this.notificacaoService.buscarNotificacoes();

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
   * Alternar filtro entre todas as notificações e apenas não lidas
   */
  public alternarFiltro(): void {
    this.filtrarApenasNaoLidas = !this.filtrarApenasNaoLidas;
    this.carregarNotificacoes();
  }

  /**
   * Marcar uma notificação como lida
   */
  public marcarComoLida(notificacao: AlertaDTO.Listagem): void {
    if (!notificacao.id) return;

    this.notificacaoService.marcarComoLida(notificacao.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Atualizar o status da notificação localmente
          const index = this.notificacoes.findIndex(n => n.id === notificacao.id);
          if (index !== -1) {
            this.notificacoes[index] = { ...this.notificacoes[index], lida: true };
          }
          // Se estiver filtrando apenas não lidas, remover da lista
          if (this.filtrarApenasNaoLidas) {
            this.carregarNotificacoes();
          }
        },
        error: (error) => {
          console.log('Informação: Problema temporário ao marcar notificação como lida');
          // Não exibe mais alertas para ações de notificação
          // O usuário pode tentar novamente se necessário
        }
      });
  }

  /**
   * Marcar todas as notificações como lidas
   */
  public marcarTodasComoLidas(): void {
    Swal.fire({
      title: 'Confirmar',
      text: 'Deseja marcar todas as notificações como lidas?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificacaoService.marcarTodasComoLidas()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.carregarNotificacoes();
              Swal.fire({
                title: 'Sucesso',
                text: 'Todas as notificações foram marcadas como lidas',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (error) => {
              Swal.fire({
                title: 'Erro',
                text: 'Erro ao marcar notificações como lidas',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          });
      }
    });
  }

  /**
   * Navegar para o item no mural
   * Responsabilidade: VIEW - Coordena ações de marcar como lida e navegação
   */
  public irParaMural(notificacao: AlertaDTO.Listagem): void {
    if (!notificacao.lida && notificacao.id) {
      this.marcarComoLida(notificacao);
    }

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

  public setActiveTab(tab: 'todas' | 'naoLidas' | 'lidas'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.paginaAtual = 1;
      // Atualiza filtro para otimizar carregamento do backend
      this.filtrarApenasNaoLidas = (tab === 'naoLidas');
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
            error: () => {
              Swal.fire('Erro', 'Não foi possível excluir a notificação.', 'error');
            }
          });
      }
    });
  }
}

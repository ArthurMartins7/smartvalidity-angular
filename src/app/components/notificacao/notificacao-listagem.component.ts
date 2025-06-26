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

  constructor(
    private notificacaoService: NotificacaoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Carrega notificações após um pequeno delay para evitar problemas de inicialização
    setTimeout(() => {
      this.carregarNotificacoes();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

    /**
   * Carregar notificações do usuário
   */
  public carregarNotificacoes(): void {
    this.carregando = true;

    const request = this.filtrarApenasNaoLidas
      ? this.notificacaoService.buscarNotificacoesNaoLidas()
      : this.notificacaoService.buscarNotificacoes();

    request.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notificacoes) => {
          this.notificacoes = notificacoes || [];
          this.carregando = false;
        },
        error: (error) => {
          // Tratamento silencioso de todos os tipos de erro
          this.carregando = false;
          this.notificacoes = [];

          // Se for erro de autenticação, redireciona para login
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/']);
            return;
          }

          // Para todos os outros casos, não faz nada (permanece silencioso)
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
            this.notificacoes[index] = { ...this.notificacoes[index] };
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
      title: 'Confirmar ação',
      text: 'Deseja marcar todas as notificações como lidas?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, marcar todas',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.notificacaoService.marcarTodasComoLidas()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.carregarNotificacoes();
              Swal.fire({
                title: 'Sucesso',
                text: 'Todas as notificações foram marcadas como lidas.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (error) => {
              console.log('Informação: Problema temporário ao marcar todas como lidas');
              // Não exibe alerta de erro, o usuário pode tentar novamente
            }
          });
      }
    });
  }

  /**
   * Navegar para o item no mural
   */
  public irParaMural(notificacao: AlertaDTO.Listagem): void {
    // Primeiro marcar como lida se ainda não foi
    if (notificacao.id) {
      this.marcarComoLida(notificacao);
    }

    // Determinar qual aba do mural abrir baseado no tipo de alerta
    let tab = 'proximo';
    switch (notificacao.tipo) {
      case TipoAlerta.VENCIMENTO_HOJE:
        tab = 'hoje';
        break;
      case TipoAlerta.VENCIMENTO_ATRASO:
        tab = 'vencido';
        break;
      case TipoAlerta.VENCIMENTO_AMANHA:
      default:
        tab = 'proximo';
        break;
    }

    this.router.navigate(['/mural-listagem'], { queryParams: { tab } });
  }

  /**
   * Obter descrição do tipo de alerta
   */
  public obterDescricaoTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_AMANHA: return 'Vence Amanhã';
      case TipoAlerta.VENCIMENTO_HOJE: return 'Vence Hoje';
      case TipoAlerta.VENCIMENTO_ATRASO: return 'Vencido';
      case TipoAlerta.PERSONALIZADO: return 'Personalizado';
      default: return 'Desconhecido';
    }
  }

  /**
   * Obter cor do tipo de alerta
   */
  public obterCorTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_AMANHA: return 'bg-yellow-100 text-yellow-800';
      case TipoAlerta.VENCIMENTO_HOJE: return 'bg-orange-100 text-orange-800';
      case TipoAlerta.VENCIMENTO_ATRASO: return 'bg-red-100 text-red-800';
      case TipoAlerta.PERSONALIZADO: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obter ícone do tipo de alerta
   */
  public obterIconeTipo(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_AMANHA: return '⚠️';
      case TipoAlerta.VENCIMENTO_HOJE: return '🚨';
      case TipoAlerta.VENCIMENTO_ATRASO: return '🔴';
      case TipoAlerta.PERSONALIZADO: return '📝';
      default: return '📋';
    }
  }

  /**
   * Formatar data/hora
   */
  public formatarDataHora(data: Date): string {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
  }

  /**
   * Voltar para página anterior
   */
  public voltar(): void {
    this.router.navigate(['/mural-listagem']);
  }

  /**
   * Obter tempo relativo (ex: "há 2 horas")
   */
  public obterTempoRelativo(data: Date): string {
    if (!data) return '';

    const agora = new Date();
    const dataNotificacao = new Date(data);
    const diferencaMs = agora.getTime() - dataNotificacao.getTime();
    const diferencaMin = Math.floor(diferencaMs / (1000 * 60));
    const diferencaHoras = Math.floor(diferencaMin / 60);
    const diferencaDias = Math.floor(diferencaHoras / 24);

    if (diferencaMin < 1) return 'agora mesmo';
    if (diferencaMin < 60) return `há ${diferencaMin} min`;
    if (diferencaHoras < 24) return `há ${diferencaHoras}h`;
    if (diferencaDias === 1) return 'há 1 dia';
    if (diferencaDias < 7) return `há ${diferencaDias} dias`;

    return this.formatarDataHora(data);
  }

  /**
   * Track by function para ngFor
   */
  public trackByNotificacao(index: number, item: AlertaDTO.Listagem): any {
    return item.id;
  }
}

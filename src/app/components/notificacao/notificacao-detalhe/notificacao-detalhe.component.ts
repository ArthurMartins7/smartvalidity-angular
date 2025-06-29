import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { NotificacaoService } from '../../../shared/service/notificacao.service';

@Component({
  selector: 'app-notificacao-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacao-detalhe.component.html',
  styleUrl: './notificacao-detalhe.component.css'
})
export class NotificacaoDetalheComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notificacao: AlertaDTO.Listagem | null = null;
  carregando: boolean = true;
  erro: string = '';

  // Enums para template
  public TipoAlerta = TipoAlerta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit(): void {
    const notificacaoId = this.route.snapshot.paramMap.get('id');
    if (notificacaoId) {
      this.carregarDetalhesNotificacao(+notificacaoId);
    } else {
      this.erro = 'ID da notificação não encontrado';
      this.carregando = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carregar detalhes da notificação
   */
  private carregarDetalhesNotificacao(id: number): void {
    this.carregando = true;

    // Como não temos um endpoint específico para buscar por ID,
    // vamos buscar todas e filtrar pelo ID
    this.notificacaoService.buscarNotificacoes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notificacoes) => {
          this.notificacao = notificacoes.find(n => n.id === id) || null;
          if (!this.notificacao) {
            this.erro = 'Notificação não encontrada';
          }
          this.carregando = false;
        },
        error: (error) => {
          this.erro = 'Erro ao carregar detalhes da notificação';
          this.carregando = false;

          // Se for erro de autenticação, redireciona para login
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/']);
          }
        }
      });
  }

  /**
   * Marcar esta notificação como lida
   */
  public marcarComoLida(): void {
    if (!this.notificacao?.id) return;

    this.notificacaoService.marcarComoLida(this.notificacao.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.notificacao) {
            this.notificacao.lida = true;
          }
        },
        error: (error) => {
          console.log('Erro ao marcar notificação como lida');
        }
      });
  }

  /**
   * Navegar para o item no mural
   */
  public irParaMural(): void {
    if (!this.notificacao) return;

    // Marcar como lida primeiro
    this.marcarComoLida();

    // Determinar qual aba do mural abrir baseado no tipo de alerta
    let tab = 'proximo';
    switch (this.notificacao.tipo) {
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
   * Voltar para lista de notificações
   */
  public voltarParaLista(): void {
    this.router.navigate(['/notificacoes']);
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
      case TipoAlerta.VENCIMENTO_AMANHA: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TipoAlerta.VENCIMENTO_HOJE: return 'bg-orange-100 text-orange-800 border-orange-200';
      case TipoAlerta.VENCIMENTO_ATRASO: return 'bg-red-100 text-red-800 border-red-200';
      case TipoAlerta.PERSONALIZADO: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
   * Formatar data/hora para exibição
   */
  public formatarDataHora(data: Date | string): string {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obter tempo relativo (ex: "há 2 horas")
   */
  public obterTempoRelativo(data: Date | string): string {
    if (!data) return '';

    const agora = new Date();
    const dataNotificacao = new Date(data);
    const diffMs = agora.getTime() - dataNotificacao.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMinutos < 1) return 'Agora mesmo';
    if (diffMinutos < 60) return `há ${diffMinutos} minuto${diffMinutos !== 1 ? 's' : ''}`;
    if (diffHoras < 24) return `há ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
    if (diffDias < 7) return `há ${diffDias} dia${diffDias !== 1 ? 's' : ''}`;

    return this.formatarDataHora(data);
  }

  /**
   * Obter prioridade visual baseada no tipo
   */
  public obterPrioridade(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_ATRASO: return 'ALTA';
      case TipoAlerta.VENCIMENTO_HOJE: return 'MÉDIA';
      case TipoAlerta.VENCIMENTO_AMANHA: return 'BAIXA';
      case TipoAlerta.PERSONALIZADO: return 'NORMAL';
      default: return 'NORMAL';
    }
  }

  /**
   * Obter cor da prioridade
   */
  public obterCorPrioridade(tipo: TipoAlerta): string {
    switch (tipo) {
      case TipoAlerta.VENCIMENTO_ATRASO: return 'text-red-600 bg-red-50 border-red-200';
      case TipoAlerta.VENCIMENTO_HOJE: return 'text-orange-600 bg-orange-50 border-orange-200';
      case TipoAlerta.VENCIMENTO_AMANHA: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TipoAlerta.PERSONALIZADO: return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { NotificacaoService } from '../../../shared/service/notificacao.service';

/**
 * Componente responsável pelos detalhes de uma notificação específica.
 *
 * RESPONSABILIDADES MVC (VIEW):
 * - Apresentar detalhes de uma notificação específica
 * - Permitir navegação para o mural relacionado
 * - Marcar notificação como lida quando visualizada
 * - Não contém lógica de negócio (delegada para o Service)
 */
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
  erro: string | null = null;

  // Enums para template
  public TipoAlerta = TipoAlerta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarDetalhesNotificacao(+id);
    } else {
      this.erro = 'ID da notificação não fornecido';
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

    this.notificacaoService.buscarNotificacaoPorId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notificacao) => {
          this.notificacao = notificacao;
          if (!this.notificacao) {
            this.erro = 'Notificação não encontrada';
          } else if (!this.notificacao.lida) {
            this.marcarComoLida();
          }
          this.carregando = false;
        },
        error: (error) => {
          this.erro = 'Erro ao carregar detalhes da notificação';
          this.carregando = false;

          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
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
        }
      });
  }

  /**
   * Voltar para lista de notificações
   */
  public voltar(): void {
    this.router.navigate(['/notificacoes']);
  }

  /**
   * Voltar para lista de notificações (alias para compatibilidade com template)
   */
  public voltarParaLista(): void {
    this.voltar();
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
}

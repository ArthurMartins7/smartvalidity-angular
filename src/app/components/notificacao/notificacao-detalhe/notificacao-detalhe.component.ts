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
            // Marcar como lida quando o usuário visualiza os detalhes
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
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public formatarDataHora(data: Date | string): string {
    if (!data) return '';
    return this.notificacaoService.formatarDataHora(new Date(data));
  }

  /**
   * Obter tempo relativo (ex: "há 2 horas")
   * Responsabilidade: VIEW - Delega cálculo para o SERVICE
   */
  public obterTempoRelativo(data: Date | string): string {
    if (!data) return '';
    return this.notificacaoService.obterTempoRelativo(new Date(data));
  }

  /**
   * Navega para o item específico ou mural com filtros aplicados
   * Responsabilidade: VIEW - Apenas coordena a navegação usando o SERVICE
   */
  public visualizarItem(): void {
    if (!this.notificacao) return;

    // Delega a lógica de decisão de navegação para o SERVICE
    this.notificacaoService.obterDadosNavegacaoItem(this.notificacao)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado) => {
          if (resultado.tipo === 'detalhe' && resultado.dados) {
            // Navegar para detalhe específico do item
            this.router.navigate(['/mural-detalhe', resultado.dados.itemId], {
              queryParams: resultado.dados.queryParams
            });
          } else if (resultado.tipo === 'listagem' && resultado.dados) {
            // Navegar para listagem com filtros
            this.router.navigate(['/mural-listagem'], {
              queryParams: resultado.dados
            });
          } else {
            // Fallback: navega para mural geral
            this.router.navigate(['/mural-listagem']);
          }
        },
        error: (error) => {
          console.error('Erro ao obter dados de navegação:', error);
          // Fallback em caso de erro
          this.router.navigate(['/mural-listagem']);
        }
      });
  }

  /**
   * Remove emojis do título da notificação para exibição
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public removerEmojis(titulo: string): string {
    return this.notificacaoService.removerEmojis(titulo);
  }

  /**
   * Verifica se a notificação tem informações de item que podem ser visualizadas
   * Responsabilidade: VIEW - Apenas delega a validação para o SERVICE
   */
  public podeVisualizarItem(): boolean {
    // Delega a lógica de validação para o SERVICE
    return this.notificacaoService.podeVisualizarItem(this.notificacao);
  }
}

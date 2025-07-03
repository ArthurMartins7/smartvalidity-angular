import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { AlertaService } from '../../../shared/service/alerta.service';
import { NotificacaoService } from '../../../shared/service/notificacao.service';

/**
 * Componente responsável pela visualização detalhada de um alerta.
 *
 * RESPONSABILIDADES MVC (VIEW):
 * - Apresentar dados detalhados do alerta ao usuário
 * - Capturar interações básicas (voltar, editar)
 * - Chamar métodos do Service para operações de negócio
 * - Não contém lógica de negócio complexa
 * - Foco na apresentação e experiência do usuário
 */
@Component({
  selector: 'app-alerta-detalhe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-detalhe.component.html',
  styleUrls: ['./alerta-detalhe.component.css']
})
export class AlertaDetalheComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  alerta: AlertaDTO.Listagem | null = null;
  carregando: boolean = false;
  alertaId: number | null = null;

  // Enums para template
  public TipoAlerta = TipoAlerta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private alertaService: AlertaService,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.alertaId = +id;
        this.carregarAlerta();
      } else {
        this.voltarParaLista();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carregar dados do alerta
   */
  private carregarAlerta(): void {
    if (!this.alertaId) return;

    this.carregando = true;
    this.alertaService.buscarPorId(this.alertaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (alerta) => {
          this.alerta = alerta;
          this.carregando = false;
        },
        error: (error) => {
          this.carregando = false;
          console.error('Erro ao carregar alerta:', error);

          if (error.status === 404) {
            Swal.fire({
              title: 'Alerta não encontrado',
              text: 'O alerta solicitado não foi encontrado ou foi excluído.',
              icon: 'warning',
              confirmButtonText: 'OK'
            }).then(() => {
              this.voltarParaLista();
            });
          } else {
            Swal.fire({
              title: 'Erro',
              text: 'Erro ao carregar dados do alerta. Tente novamente.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
      });
  }

  /**
   * Voltar para a página anterior
   */
  public voltarParaLista(): void {
    this.location.back();
  }

  /**
   * Editar o alerta atual
   */
  public editarAlerta(): void {
    if (!this.alerta) return;

    if (this.alerta.tipo !== TipoAlerta.PERSONALIZADO) {
      Swal.fire({
        title: 'Alerta Automático',
        text: 'Alertas automáticos não podem ser editados. Apenas alertas personalizados são editáveis.',
        icon: 'info',
        confirmButtonText: 'Entendi'
      });
      return;
    }

    this.router.navigate(['/alerta-editar', this.alerta.id]);
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
   * Formatar data/hora completa
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public formatarDataHora(data: Date): string {
    if (!data) return '-';
    return this.notificacaoService.formatarDataHora(data);
  }

  /**
   * Remove emojis do título do alerta
   * Responsabilidade: VIEW - Delega formatação para o SERVICE
   */
  public removerEmojis(titulo: string): string {
    return this.notificacaoService.removerEmojis(titulo);
  }

  /**
   * Verificar se o alerta pode ser editado
   */
  public podeEditar(): boolean {
    return this.alerta?.tipo === TipoAlerta.PERSONALIZADO;
  }

  /**
   * Navegar para a página de detalhes do item no mural
   */
  public visualizarItem(itemId: string): void {
    this.router.navigate(['/mural-detalhe', itemId]);
  }
}

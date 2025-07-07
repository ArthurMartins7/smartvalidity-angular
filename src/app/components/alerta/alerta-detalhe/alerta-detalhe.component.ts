import { CommonModule, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { ItemProdutoDTO } from '../../../shared/model/dto/item-Produto.dto';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { AlertaService } from '../../../shared/service/alerta.service';
import { ItemProdutoService } from '../../../shared/service/item-produto.service';
import { NotificacaoService } from '../../../shared/service/notificacao.service';

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
  itensProdutoNaoInspecionados: ItemProdutoDTO[] = [];

  public TipoAlerta = TipoAlerta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private alertaService: AlertaService,
    private itemProdutoService: ItemProdutoService,
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

  private carregarAlerta(): void {
    if (!this.alertaId) return;

    this.carregando = true;
    this.alertaService.buscarPorId(this.alertaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (alerta) => {
          this.alerta = alerta;
          this.carregando = false;
          
          // Carregar itens-produto se for alerta personalizado e houver produtos relacionados
          if (this.alerta && this.alerta.tipo === TipoAlerta.PERSONALIZADO && 
              this.alerta.produtosAlertaIds && this.alerta.produtosAlertaIds.length > 0) {
            this.carregarItensProduto();
          }
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
   * Carregar itens-produto não inspecionados dos produtos relacionados
   */
  private carregarItensProduto(): void {
    if (!this.alerta?.produtosAlertaIds || this.alerta.produtosAlertaIds.length === 0) {
      return;
    }

    // Buscar itens do primeiro produto
    const produtoId = this.alerta.produtosAlertaIds[0];
    
    this.itemProdutoService.buscarItensProdutoNaoInspecionadosPorProduto(produtoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (itens: ItemProdutoDTO[]) => {
          this.itensProdutoNaoInspecionados = itens;
          console.log(`Encontrados ${itens.length} itens-produto não inspecionados para o alerta`);
        },
        error: (erro: any) => {
          console.error('Erro ao buscar itens-produto não inspecionados:', erro);
          this.itensProdutoNaoInspecionados = [];
        }
      });
  }

  /**
   * Obtém a classe CSS para o status de vencimento
   */
  public getStatusVencimento(dataVencimento: Date | string): string {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays === 0) return 'bg-orange-100 text-orange-800';
    if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  /**
   * Obtém o texto do status de vencimento
   */
  public getTextoVencimento(dataVencimento: Date | string): string {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoje';
    if (diffDays === 1) return 'Vence amanhã';
    return `${diffDays} dias`;
  }

  /**
   * Verifica se o alerta é personalizado
   */
  public ehAlertaPersonalizado(): boolean {
    if (!this.alerta) {
      return false;
    }
    return this.alerta.tipo === TipoAlerta.PERSONALIZADO;
  }

  public voltarParaLista(): void {
    this.location.back();
  }

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

  public obterDescricaoTipo(tipo: TipoAlerta): string {
    return this.notificacaoService.obterDescricaoTipo(tipo);
  }

  public obterCorTipo(tipo: TipoAlerta): string {
    return this.notificacaoService.obterCorTipo(tipo);
  }

  public formatarDataHora(data: Date): string {
    if (!data) return '-';
    return this.notificacaoService.formatarDataHora(data);
  }

  public removerEmojis(titulo: string): string {
    return this.notificacaoService.removerEmojis(titulo);
  }

  public podeEditar(): boolean {
    if (!this.alerta) {
      return false;
    }
    return this.alerta.tipo === TipoAlerta.PERSONALIZADO;
  }

  public podeVisualizarItem(): boolean {
    if (!this.alerta || !this.alerta.produtosAlerta) {
      return false;
    }
    // Remove o botão para alertas personalizados
    if (this.alerta.tipo === TipoAlerta.PERSONALIZADO) {
      return false;
    }
    return this.alerta.produtosAlerta.length > 0;
  }

  public obterPrimeiroProduto(): string {
    if (!this.alerta || !this.alerta.produtosAlerta || this.alerta.produtosAlerta.length === 0) {
      return '';
    }
    return this.alerta.produtosAlerta[0];
  }

  public ehAlertaAutomatico(): boolean {
    if (!this.alerta) {
      return false;
    }
    return this.alerta.tipo !== TipoAlerta.PERSONALIZADO;
  }

  public obterStatusInspecao(): string {
    if (!this.alerta) return '';
    
    if (this.alerta.itemInspecionado === true) {
      return 'Produto já inspecionado';
    } else if (this.alerta.itemInspecionado === false) {
      return 'Produto ainda não inspecionado';
    }
    
    return 'Status de inspeção não informado';
  }

  public obterCorStatusInspecao(): string {
    if (!this.alerta) return 'border-gray-400';
    
    if (this.alerta.itemInspecionado === true) {
      return 'border-emerald-400';
    } else if (this.alerta.itemInspecionado === false) {
      return 'border-red-400';
    }
    
    return 'border-gray-400';
  }

  public obterCorFundoStatusInspecao(): string {
    if (!this.alerta) return 'bg-gray-100';
    
    if (this.alerta.itemInspecionado === true) {
      return 'bg-emerald-100';
    } else if (this.alerta.itemInspecionado === false) {
      return 'bg-red-100';
    }
    
    return 'bg-gray-100';
  }

  public obterCorIconeStatusInspecao(): string {
    if (!this.alerta) return 'text-gray-600';
    
    if (this.alerta.itemInspecionado === true) {
      return 'text-emerald-600';
    } else if (this.alerta.itemInspecionado === false) {
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  }

  public obterIconeStatusInspecao(): string {
    if (!this.alerta) return 'help_outline';
    
    if (this.alerta.itemInspecionado === true) {
      return 'check_circle';
    } else if (this.alerta.itemInspecionado === false) {
      return 'cancel';
    }
    
    return 'help_outline';
  }

  public excluirAlerta(): void {
    if (!this.alerta) return;

    Swal.fire({
      title: 'Tem certeza?',
      text: `Deseja excluir o alerta "${this.removerEmojis(this.alerta.titulo)}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.alerta) {
        this.alertaService.excluirAlerta(this.alerta.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              Swal.fire('Excluído!', 'Alerta excluído com sucesso.', 'success').then(() => {
                this.voltarParaLista();
              });
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

  public visualizarItem(_unused?: any): void {
    if (!this.alerta) return;

    // loading enquanto busca informações:
    Swal.fire({
      title: 'Carregando...',
      text: 'Buscando informações do item',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.notificacaoService.obterDadosNavegacaoItem(this.alerta)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado) => {
          Swal.close();

          if (resultado.tipo === 'detalhe' && resultado.dados) {
            // navega para o detalhe do item:
            this.router.navigate([
              '/mural-detalhe',
              resultado.dados.itemId
            ], {
              queryParams: resultado.dados.queryParams
            });
          } else if (resultado.tipo === 'listagem' && resultado.dados) {
            // navega para listagem do mural com filtros aplicados
            this.router.navigate(['/mural-listagem'], {
              queryParams: resultado.dados
            });
          } else {
            // fallback: redireciona para mural genérico
            Swal.fire({
              title: 'Atenção',
              text: 'Não foi possível encontrar o item específico. Redirecionando para o mural.',
              icon: 'info',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/mural-listagem']);
            });
          }
        },
        error: () => {
          Swal.close();
          Swal.fire({
            title: 'Erro',
            text: 'Não foi possível carregar as informações do item. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { ItemProdutoDTO } from '../../../shared/model/dto/item-Produto.dto';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { ItemProdutoService } from '../../../shared/service/item-produto.service';
import { NotificacaoService } from '../../../shared/service/notificacao.service';

/**
 * Componente responsável pelos detalhes de uma notificação específica.
 *
 * RESPONSABILIDADES MVC (VIEW):
 * - Apresentar detalhes de uma notificação específica
 * - Permitir navegação para o mural relacionado
 * - Permitir exclusão da notificação
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
  itensProdutoNaoInspecionados: ItemProdutoDTO[] = [];

  // Enums para template
  public TipoAlerta = TipoAlerta;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificacaoService: NotificacaoService,
    private itemProdutoService: ItemProdutoService
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
          }
          
          // Carregar itens-produto se houver produtos relacionados
          if (this.notificacao && this.notificacao.produtosAlertaIds && this.notificacao.produtosAlertaIds.length > 0) {
            this.carregarItensProduto();
          } else {
            // Se não houver produtos relacionados, limpar a lista
            this.itensProdutoNaoInspecionados = [];
          }
          
          this.carregando = false;
        },
        error: (error: any) => {
          this.erro = 'Erro ao carregar detalhes da notificação';
          this.carregando = false;

          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  /**
   * Carregar itens-produto não inspecionados dos produtos relacionados
   */
  private carregarItensProduto(): void {
    if (!this.notificacao?.produtosAlertaIds || this.notificacao.produtosAlertaIds.length === 0) {
      return;
    }

    // Buscar itens do primeiro produto (assumindo que notificações têm apenas um produto)
    const produtoId = this.notificacao.produtosAlertaIds[0];
    
    this.itemProdutoService.buscarItensProdutoNaoInspecionadosPorProduto(produtoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (itens: ItemProdutoDTO[]) => {
          this.itensProdutoNaoInspecionados = itens;
          console.log(`Encontrados ${itens.length} itens-produto não inspecionados para a notificação`);
        },
        error: (erro: any) => {
          console.error('Erro ao buscar itens-produto não inspecionados:', erro);
          this.itensProdutoNaoInspecionados = [];
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

    // Mostrar loading
    Swal.fire({
      title: 'Carregando...',
      text: 'Buscando informações do item',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Delega a lógica de decisão de navegação para o SERVICE
    this.notificacaoService.obterDadosNavegacaoItem(this.notificacao)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado) => {
          Swal.close();
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
            // Fallback: navega para mural geral com mensagem
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
        error: (error: any) => {
          console.error('Erro ao obter dados de navegação:', error);
          // Feedback de erro para o usuário
          Swal.fire({
            title: 'Erro',
            text: 'Não foi possível carregar as informações do item. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
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
   * Verifica se a notificação tem informações de item que podem ser visualizadas
   * Responsabilidade: VIEW - Apenas delega a validação para o SERVICE
   */
  public podeVisualizarItem(): boolean {
    // Delega a lógica de validação para o SERVICE
    return this.notificacaoService.podeVisualizarItem(this.notificacao);
  }

  /**
   * Verifica se a notificação vem de um alerta automático
   */
  public ehAlertaAutomatico(): boolean {
    if (!this.notificacao) {
      return false;
    }
    return this.notificacao.tipo !== TipoAlerta.PERSONALIZADO;
  }

  /**
   * Verifica se pode visualizar item (versão melhorada)
   */
  public podeVisualizarItemMelhorado(): boolean {
    if (!this.notificacao) {
      return false;
    }
    return this.notificacaoService.podeVisualizarItem(this.notificacao);
  }

  /**
   * Obter status de inspeção da notificação
   */
  public obterStatusInspecao(): string {
    if (!this.notificacao) return '';
    
    if (this.notificacao.itemInspecionado === true) {
      return 'Produto já inspecionado';
    } else if (this.notificacao.itemInspecionado === false) {
      return 'Produto ainda não inspecionado';
    }
    
    return 'Status de inspeção não informado';
  }

  /**
   * Obter cor da borda do card de status de inspeção
   */
  public obterCorStatusInspecao(): string {
    if (!this.notificacao) return 'border-gray-400';
    
    if (this.notificacao.itemInspecionado === true) {
      return 'border-emerald-400';
    } else if (this.notificacao.itemInspecionado === false) {
      return 'border-red-400';
    }
    
    return 'border-gray-400';
  }

  /**
   * Obter cor de fundo do ícone de status de inspeção
   */
  public obterCorFundoStatusInspecao(): string {
    if (!this.notificacao) return 'bg-gray-100';
    
    if (this.notificacao.itemInspecionado === true) {
      return 'bg-emerald-100';
    } else if (this.notificacao.itemInspecionado === false) {
      return 'bg-red-100';
    }
    
    return 'bg-gray-100';
  }

  /**
   * Obter cor do ícone de status de inspeção
   */
  public obterCorIconeStatusInspecao(): string {
    if (!this.notificacao) return 'text-gray-600';
    
    if (this.notificacao.itemInspecionado === true) {
      return 'text-emerald-600';
    } else if (this.notificacao.itemInspecionado === false) {
      return 'text-red-600';
    }
    
    return 'text-gray-600';
  }

  /**
   * Obter ícone de status de inspeção
   */
  public obterIconeStatusInspecao(): string {
    if (!this.notificacao) return 'help_outline';
    
    if (this.notificacao.itemInspecionado === true) {
      return 'check_circle';
    } else if (this.notificacao.itemInspecionado === false) {
      return 'cancel';
    }
    
    return 'help_outline';
  }

  public excluirNotificacao(): void {
    console.log('Método excluirNotificacao chamado', this.notificacao?.id);
    if (!this.notificacao?.id) return;

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
        this.notificacaoService.excluirNotificacao(this.notificacao!.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              Swal.fire('Excluída!', 'Notificação removida com sucesso.', 'success');
              this.voltarParaLista();
            },
            error: (error: any) => {
              const msg = error.error?.message || 'Não foi possível excluir a notificação.';
              Swal.fire('Aviso', msg, 'warning');
            }
          });
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralListagemDTO } from '../../../shared/model/dto/mural.dto';
import { MuralSelecaoService } from '../../../shared/service/mural.service';

// Tipo para as ações disponíveis
type AcaoTipo = 'relatorio-selecionados' | 'relatorio-pagina' | 'relatorio-todos' | 'inspecao';

@Component({
  selector: 'app-modal-acoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-acoes.component.html',
  styleUrls: ['./modal-acoes.component.css']
})
export class ModalAcoesComponent implements OnInit, OnDestroy {
  @Output() acaoSelecionada = new EventEmitter<AcaoTipo>();
  @Input() itensPaginaAtual: MuralListagemDTO[] = [];
  @Input() totalItensAba: number = 0;

  // Propriedades para controle do modal
  visible = false;
  itensSelecionadosCount = 0;
  itensPaginaCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(private selecaoService: MuralSelecaoService) { }

  ngOnInit(): void {
    // Inscrever-se nas mudanças de visibilidade do modal
    const visibilitySubscription = this.selecaoService.showAcoesModal$.subscribe(
      visible => {
        this.visible = visible;
        if (visible) {
          this.atualizarContadores();
        }
      }
    );

    // Inscrever-se nas mudanças de seleção
    const selectionSubscription = this.selecaoService.selectedItems$.subscribe(
      () => {
        if (this.visible) {
          this.atualizarContadores();
        }
      }
    );

    this.subscriptions.push(visibilitySubscription, selectionSubscription);
  }

  ngOnDestroy(): void {
    // Cancelar todas as subscriptions ativas
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Atualiza os contadores de itens
   */
  private atualizarContadores(): void {
    this.itensSelecionadosCount = this.selecaoService.getSelectedItemsCount();
    this.itensPaginaCount = this.itensPaginaAtual.length;
  }

  /**
   * Fecha o modal de ações
   */
  closeModal(): void {
    this.selecaoService.closeAcoesModal();
  }

  /**
   * Seleciona uma ação e emite o evento
   */
  selecionarAcao(acao: AcaoTipo): void {
    switch (acao) {
      case 'relatorio-pagina':
        // Seleciona temporariamente todos os itens da página
        this.selecaoService.selectAll(this.itensPaginaAtual, true);
        break;
      case 'relatorio-todos':
        // Atualiza o total de itens na aba
        this.selecaoService.selectAllInTab(this.totalItensAba);
        break;
    }

    this.acaoSelecionada.emit(acao);
    this.closeModal();
  }
}

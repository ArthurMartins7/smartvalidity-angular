import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralSelecaoService } from '../../../shared/service/mural.service';

@Component({
  selector: 'app-modal-acoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-acoes.component.html',
  styleUrls: ['./modal-acoes.component.css']
})
export class ModalAcoesComponent implements OnInit, OnDestroy {
  @Output() acaoSelecionada = new EventEmitter<'relatorio' | 'inspecao'>();

  // Propriedades para controle do modal
  visible = false;
  itensSelecionadosCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(private selecaoService: MuralSelecaoService) { }

  ngOnInit(): void {
    // Inscrever-se nas mudanças de visibilidade do modal
    const visibilitySubscription = this.selecaoService.showAcoesModal$.subscribe(
      visible => {
        this.visible = visible;
        if (visible) {
          this.itensSelecionadosCount = this.selecaoService.getSelectedItemsCount();
        }
      }
    );

    this.subscriptions.push(visibilitySubscription);
  }

  ngOnDestroy(): void {
    // Cancelar todas as subscriptions ativas
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
  selecionarAcao(acao: 'relatorio' | 'inspecao'): void {
    this.acaoSelecionada.emit(acao);
    this.closeModal();
  }
}

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
  temItensInspecionados = false;
  mensagemInspecao = '';

  private subscriptions: Subscription[] = [];

  constructor(private selecaoService: MuralSelecaoService) { }

  ngOnInit(): void {
    // Inscreve-se para receber atualizações do estado do modal
    this.subscriptions.push(
      this.selecaoService.showAcoesModal$.subscribe(
        show => {
          this.visible = show;
          if (show) {
            this.atualizarContadores();
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    // Cancela todas as inscrições ao destruir o componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Atualiza os contadores de itens
   */
  private atualizarContadores(): void {
    this.selecaoService.getSelectedItems().subscribe(items => {
      this.itensSelecionadosCount = items.length;

      // Verifica se há itens já inspecionados
      const itensInspecionados = items.filter(item => item.inspecionado);
      this.temItensInspecionados = itensInspecionados.length > 0;

      if (this.temItensInspecionados) {
        this.mensagemInspecao = `Existem ${itensInspecionados.length} produto(s) já inspecionado(s) no grupo que você selecionou. Desmarque estes produtos já inspecionados e tente inspecionar os outros produtos novamente.`;
      } else {
        this.mensagemInspecao = '';
      }
    });

    this.itensPaginaCount = this.itensPaginaAtual.length;
  }

  /**
   * Seleciona uma ação e emite o evento
   */
  selecionarAcao(acao: AcaoTipo): void {
    // Se for ação de inspeção e houver itens já inspecionados, não permite
    if (acao === 'inspecao' && this.temItensInspecionados) {
      return;
    }

    this.acaoSelecionada.emit(acao);
    this.closeModal();
  }

  /**
   * Fecha o modal de ações
   */
  closeModal(): void {
    this.selecaoService.closeAcoesModal();
  }

  desmarcarInspecionadosSelecionados(): void {
    this.selecaoService.getSelectedItems().subscribe(items => {
      this.selecaoService.desmarcarInspecionados(items);
      this.atualizarContadores();
    });
  }
}

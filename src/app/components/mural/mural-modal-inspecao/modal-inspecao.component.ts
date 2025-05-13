import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralSelecaoService } from '../../../services/mural-selecao.service';

@Component({
  selector: 'app-modal-inspecao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-inspecao.component.html',
  styleUrls: ['./modal-inspecao.component.css']
})
export class ModalInspecaoComponent implements OnInit, OnDestroy {
  @Output() inspecaoConfirmada = new EventEmitter<void>();

  // Propriedades para controle do modal
  visible = false;
  motivoInspecao = '';
  motivoInspecaoError: string | null = null;
  motivosInspecao: string[] = [];
  itensSelecionadosCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(private selecaoService: MuralSelecaoService) { }

  ngOnInit(): void {
    // Obter os motivos de inspeção do service
    this.motivosInspecao = this.selecaoService.motivosInspecao;

    // Inscrever-se nas mudanças de visibilidade do modal
    const visibilitySubscription = this.selecaoService.showInspecaoModal$.subscribe(
      visible => {
        this.visible = visible;
        if (visible) {
          this.itensSelecionadosCount = this.selecaoService.getSelectedItemsCount();
        }
      }
    );

    // Inscrever-se nas mudanças do motivo de inspeção selecionado
    const motivoSubscription = this.selecaoService.motivoInspecao$.subscribe(
      motivo => this.motivoInspecao = motivo
    );

    // Inscrever-se nas mensagens de erro
    const errorSubscription = this.selecaoService.motivoInspecaoError$.subscribe(
      error => this.motivoInspecaoError = error
    );

    this.subscriptions.push(visibilitySubscription, motivoSubscription, errorSubscription);
  }

  ngOnDestroy(): void {
    // Cancelar todas as subscriptions ativas
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Fecha o modal de inspeção
   */
  closeModal(): void {
    this.selecaoService.closeInspecaoModal();
  }

  /**
   * Seleciona um motivo de inspeção
   */
  selecionarMotivo(motivo: string): void {
    this.selecaoService.selecionarMotivo(motivo);
  }

  /**
   * Confirma a inspeção com o motivo selecionado
   */
  confirmarInspecao(): void {
    // Se não houver motivo selecionado, o serviço irá emitir um erro
    if (!this.motivoInspecao) {
      this.selecaoService.selecionarMotivo(''); // Isso vai disparar o erro no serviço
      return;
    }

    try {
      // O serviço irá fazer a chamada ao backend
      this.inspecaoConfirmada.emit();
    } catch (error) {
      console.error('Erro ao tentar confirmar inspeção:', error);
    }
  }
}

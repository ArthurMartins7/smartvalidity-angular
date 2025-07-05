import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralSelecaoService } from '../../../shared/service/mural.service';

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
  motivoCustomizado = '';
  motivoInspecaoError: string | null = null;
  motivosInspecao: string[] = [];
  itensSelecionadosCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(private selecaoService: MuralSelecaoService) { }

  ngOnInit(): void {
    this.motivosInspecao = this.selecaoService.motivosInspecao;

    const visibilitySubscription = this.selecaoService.showInspecaoModal$.subscribe(
      visible => {
        this.visible = visible;
        if (visible) {
          this.itensSelecionadosCount = this.selecaoService.getSelectedItemsCount();
        }
      }
    );

    const motivoSubscription = this.selecaoService.motivoInspecao$.subscribe(
      motivo => this.motivoInspecao = motivo
    );

    const motivoCustomizadoSubscription = this.selecaoService.motivoCustomizado$.subscribe(
      motivo => this.motivoCustomizado = motivo
    );

    const errorSubscription = this.selecaoService.motivoInspecaoError$.subscribe(
      error => this.motivoInspecaoError = error
    );

    this.subscriptions.push(
      visibilitySubscription,
      motivoSubscription,
      motivoCustomizadoSubscription,
      errorSubscription
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeModal(): void {
    this.selecaoService.closeInspecaoModal();
  }

  selecionarMotivo(motivo: string): void {
    this.selecaoService.selecionarMotivo(motivo);
  }

  confirmarInspecao(): void {
    if (!this.motivoInspecao) {
      this.selecaoService.selecionarMotivo('');
      return;
    }

    try {
      this.inspecaoConfirmada.emit();
    } catch (error) {
      console.error('Erro ao tentar confirmar inspeção:', error);
    }
  }

  onMotivoCustomizadoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selecaoService.atualizarMotivoCustomizado(input.value);
  }
}

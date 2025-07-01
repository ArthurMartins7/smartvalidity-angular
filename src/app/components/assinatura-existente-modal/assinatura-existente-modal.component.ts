import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-assinatura-existente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assinatura-existente-modal.component.html',
  styleUrls: ['./assinatura-existente-modal.component.css']
})
export class AssinaturaExistenteModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}

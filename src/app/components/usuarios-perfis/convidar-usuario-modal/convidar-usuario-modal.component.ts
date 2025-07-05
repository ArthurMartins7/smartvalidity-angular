import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-convidar-usuario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convidar-usuario-modal.component.html',
  styleUrl: './convidar-usuario-modal.component.css'
})
export class ConvidarUsuarioModalComponent {
  nome = '';
  email = '';
  perfil = 'OPERADOR';
  perfis = ['ADMIN', 'OPERADOR'];

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  enviarConvite(): void {
    console.log('Enviando convite para:', this.nome, this.email, 'com o perfil:', this.perfil);
    this.close.emit();
  }
}

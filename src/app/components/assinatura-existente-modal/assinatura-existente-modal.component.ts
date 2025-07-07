import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-assinatura-existente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assinatura-existente-modal.component.html',
  styleUrls: ['./assinatura-existente-modal.component.css']
})
export class AssinaturaExistenteModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  assinanteEmail: string = '';
  assinanteNome: string = '';

  private authService = inject(AuthenticationService);

  ngOnInit(): void {
    this.authService.buscarAssinante().subscribe({
      next: (u) => { this.assinanteEmail = u.email || ''; this.assinanteNome = u.nome || ''; },
      error: (_) => {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar informações do assinante.',
          confirmButtonColor: '#5084C1'
        });
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioConviteDTO } from '../../../shared/model/dto/usuario-convite.dto';
import { PerfilAcesso } from '../../../shared/model/enum/perfil-acesso.enum';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-convidar-usuario-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convidar-usuario-modal.component.html',
  styleUrl: './convidar-usuario-modal.component.css'
})
export class ConvidarUsuarioModalComponent {

  perfis = ['ADMIN', 'OPERADOR'];

  @Output() close = new EventEmitter<void>();
  @Output() invited = new EventEmitter<void>();

  private usuarioService = inject(UsuarioService);
  public usuarioConviteDTO: UsuarioConviteDTO = new UsuarioConviteDTO();
  isLoading = false;

  constructor() {
    this.usuarioConviteDTO.perfilAcesso = PerfilAcesso.OPERADOR;
  }

  onClose(): void {
    this.close.emit();
  }

  enviarConvite(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    this.usuarioConviteDTO.nome = (this.usuarioConviteDTO.nome || '').trim();
    this.usuarioConviteDTO.email = (this.usuarioConviteDTO.email || '').trim();
    this.usuarioConviteDTO.cargo = (this.usuarioConviteDTO.cargo || '').trim();

    this.isLoading = true;
    this.usuarioService.convidar(this.usuarioConviteDTO).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Convite enviado', text: 'Usuário convidado com sucesso!', confirmButtonColor: '#5084C1' });
        this.invited.emit();
        this.close.emit();
        this.isLoading = false;
      },
      error: (err) => {
        const mensagem = err?.error?.message ?? (typeof err.error === 'string' ? err.error : err.message) ?? 'Erro ao enviar convite.';
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem, confirmButtonColor: '#5084C1' });
        this.isLoading = false;
      }
    });
  }
}

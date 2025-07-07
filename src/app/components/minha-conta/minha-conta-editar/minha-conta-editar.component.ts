import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../../../core/auth/services/auth.service';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-minha-conta-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective, NgxMaskPipe],
  providers: [provideNgxMask()],
  templateUrl: './minha-conta-editar.component.html',
  styleUrl: './minha-conta-editar.component.css'
})
export class MinhaContaEditarComponent implements OnInit {

  usuario: Usuario = new Usuario();
  empresa = { cnpj: '', razaoSocial: '' };

  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (u: Usuario) => {
        this.usuario = u;
        if (u.empresa) {
          this.empresa = {
            cnpj: u.empresa.cnpj,
            razaoSocial: u.empresa.razaoSocial
          };
        }
      },
      error: (err: any) => console.error('Erro ao carregar dados da conta', err)
    });
  }

  salvar(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid) {
      formEl.reportValidity();
      return;
    }

    if (!this.usuario.id) {
      console.error('ID do usuário não carregado.');
      return;
    }

    const payload = {
      nome: this.usuario.nome,
      cargo: this.usuario.cargo
    } as Partial<Usuario>;

    this.usuarioService.alterar(this.usuario.id, payload).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Alterações salvas', confirmButtonColor: '#5084C1' }).then(() => {
          this.router.navigate(['/minha-conta-info']);
        });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao salvar alterações.';
        Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#5084C1' });
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/minha-conta-info']);
  }
}

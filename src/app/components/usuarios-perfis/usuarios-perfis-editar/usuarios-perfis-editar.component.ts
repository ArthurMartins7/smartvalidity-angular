import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import Swal from 'sweetalert2';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-usuarios-perfis-editar',
  imports: [CommonModule, FormsModule, NgxMaskDirective, NgxMaskPipe],
  providers: [provideNgxMask()],
  templateUrl: './usuarios-perfis-editar.component.html',
  styleUrl: './usuarios-perfis-editar.component.css'
})
export class UsuariosPerfisEditarComponent implements OnInit {

  usuario: Usuario = new Usuario();
  empresa = { cnpj: '', razaoSocial: '' };

  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  id: string = '';
  isLoggedAssinanteEditingSelf = false;
  isEditingOwnProfile = false;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.usuarioService.buscarPorId(this.id).subscribe({
        next: (u) => {
          this.usuario = u;
          if (u.empresa) {
            this.empresa.cnpj = u.empresa.cnpj;
            this.empresa.razaoSocial = u.empresa.razaoSocial;
          }

          const loggedPerfil = sessionStorage.getItem('usuarioPerfil');
          const loggedEmail = sessionStorage.getItem('usuarioEmail');
          this.isLoggedAssinanteEditingSelf = loggedPerfil === 'ASSINANTE' && loggedEmail === u.email;
          this.isEditingOwnProfile = loggedEmail === u.email;
        },
        error: (err) => console.error('Erro ao carregar usuário', err)
      });
    }
  }

  salvar(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid) {
      formEl.reportValidity();
      return;
    }

    const payload = {
      perfilAcesso: this.usuario.perfilAcesso,
      nome: this.usuario.nome,
      cargo: this.usuario.cargo
    } as Partial<Usuario>;

    this.usuarioService.alterar(this.id, payload).subscribe({
      next: (_) => {
        console.log(this.usuario);
        Swal.fire({ icon: 'success', title: 'Alterações salvas', confirmButtonColor: '#5084C1' }).then(() => {
          this.router.navigate(['/usuarios-perfis-listagem']);
        });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao salvar alterações.';
        Swal.fire({ icon: 'error', title: 'Erro', text: msg, confirmButtonColor: '#5084C1' });
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/usuarios-perfis-listagem']);
  }
}

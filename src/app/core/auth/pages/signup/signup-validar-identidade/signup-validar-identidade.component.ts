import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EmpresaUsuarioDto } from '../../../../../shared/model/dto/empresaUsuario.dto';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";
import { AuthenticationService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup-validar-identidade',
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './signup-validar-identidade.component.html',
  styleUrl: './signup-validar-identidade.component.css'
})
export class SignupValidarIdentidadeComponent {

  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  public codigo: string = '';

  public emailDestino: string = '';
  isResending = false;

  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  constructor() {
    const usuarioJson = sessionStorage.getItem('signup_usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.emailDestino = usuario.email || '';
      } catch (_) {}
    }
  }

  public criarConta(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    const usuarioJson = sessionStorage.getItem('signup_usuario');
    const empresaJson = sessionStorage.getItem('signup_empresa');
    const senha = sessionStorage.getItem('signup_senha');

    if (!usuarioJson || !empresaJson || !senha) {
      Swal.fire({ icon: 'error', title: 'Dados incompletos', text: 'Por favor, refaça o cadastro.', confirmButtonColor: '#5084C1' });
      this.router.navigate(['signup-info-pessoais']);
      return;
    }

    const usuarioObj: Usuario = JSON.parse(usuarioJson);
    const empresaObj: Empresa = JSON.parse(empresaJson);

    const dto: EmpresaUsuarioDto = {
      cnpj: empresaObj.cnpj,
      razaoSocial: empresaObj.razaoSocial,
      nomeUsuario: usuarioObj.nome,
      email: usuarioObj.email,
      senha: senha,
      cargo: usuarioObj.cargo,
      token: this.codigo
    } as EmpresaUsuarioDto;

    this.authenticationService.registrarEmpresa(dto).subscribe({
      next: (_) => {
        Swal.fire({ icon: 'success', title: 'Conta criada com sucesso!', confirmButtonColor: '#5084C1' });
        sessionStorage.removeItem('signup_usuario');
        sessionStorage.removeItem('signup_empresa');
        sessionStorage.removeItem('signup_senha');
        this.router.navigate(['']);
      },
      error: (erro) => {
        console.error('Erro ao criar conta:', erro);
        const mensagem = erro.error?.message ?? (typeof erro.error === 'string' ? erro.error : erro.message) ?? 'Código inválido ou expirado';
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem, confirmButtonColor: '#5084C1' });
      }
    });
  }

  public voltar(): void {
    this.router.navigate(['signup-verificacao']);
  }

  public reenviarCodigo(): void {
    if (!this.emailDestino) {
      Swal.fire({ icon: 'warning', title: 'E-mail não informado.', confirmButtonColor: '#5084C1' });
      return;
    }

    this.isResending = true;
    this.authenticationService.enviarOtpEmail(this.emailDestino).subscribe({
      next: () => Swal.fire({ icon: 'success', title: 'Código enviado', confirmButtonColor: '#5084C1' }),
      error: (err) => {
        const mensagem = err?.error || 'Não foi possível enviar o código.';
        Swal.fire({ icon: 'error', title: 'Erro', text: mensagem, confirmButtonColor: '#5084C1' });
      },
      complete: () => { this.isResending = false; }
    });
  }

  public onCodigoInput(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    this.codigo = digits;
    input.value = digits;

    if (digits.length < 6) {
      input.setCustomValidity('Informe 6 dígitos.');
    } else {
      input.setCustomValidity('');
    }
  }

}

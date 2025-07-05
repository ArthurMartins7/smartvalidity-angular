import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { TermosCondicoesModalComponent } from '../../../../../components/termos-condicoes-modal/termos-condicoes-modal.component';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";

@Component({
  selector: 'app-signup-info-pessoais',
  standalone: true,
  imports: [FormsModule, HeaderAuthComponent, RouterModule, TermosCondicoesModalComponent],
  templateUrl: './signup-info-pessoais.component.html',
  styleUrl: './signup-info-pessoais.component.css'
})
export class SignupInfoPessoaisComponent {
  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  private router = inject(Router);
  private dialog = inject(MatDialog);

  public avancar(form: NgForm, event: Event): void {
    const formEl = event.target as HTMLFormElement;
    if (form.invalid || !formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }

    if (!this.aceitaTermos) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Você precisa aceitar os termos e condições de uso para continuar.'
      });
      return;
    }

    sessionStorage.setItem('signup_usuario', JSON.stringify(this.usuario));
    sessionStorage.setItem('signup_empresa', JSON.stringify(this.empresa));
    sessionStorage.setItem('signup_marketing', JSON.stringify(this.receberNoticias));

    this.router.navigate(['signup-senha']);
  }

  public onCnpjInput(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '').slice(0, 14);

    this.empresa.cnpj = digits;

    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
    }
    if (digits.length >= 3) {
      formatted += '.' + digits.substring(2, 5);
    }
    if (digits.length >= 6) {
      formatted += '.' + digits.substring(5, 8);
    }
    if (digits.length >= 9) {
      formatted += '/' + digits.substring(8, 12);
    }
    if (digits.length >= 13) {
      formatted += '-' + digits.substring(12, 14);
    }

    input.value = formatted;

    if (digits.length === 0) {
      input.setCustomValidity('CNPJ é obrigatório');
    } else if (digits.length < 14) {
      input.setCustomValidity('CNPJ incompleto');
    } else {
      input.setCustomValidity('');
    }
  }

  public openTerms(event: Event): void {
    event.preventDefault();
    this.dialog.open(TermosCondicoesModalComponent, {
      width: '800px',
      maxHeight: '90vh'
    });
  }
}

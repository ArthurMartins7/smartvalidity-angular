import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";

@Component({
  selector: 'app-signup-senha',
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './signup-senha.component.html',
  styleUrl: './signup-senha.component.css'
})
export class SignupSenhaComponent {
  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  public senha: string = '';
  public confirmarSenha: string = '';

  public showSenha: boolean = false;
  public showConfirmarSenha: boolean = false;

  private router = inject(Router);

  @ViewChild('confirmSenhaInput') confirmSenhaInput!: ElementRef<HTMLInputElement>;

  public avancar(form: NgForm, event: Event): void {
    if (form.invalid) {
      (event.target as HTMLFormElement).reportValidity();
      return;
    }

    this.confirmSenhaInput.nativeElement.setCustomValidity(''); // limpa mensagem anterior
    if (this.senha !== this.confirmarSenha) {
      this.confirmSenhaInput.nativeElement.setCustomValidity('As senhas não coincidem');
      (event.target as HTMLFormElement).reportValidity();
      return;
    }

    sessionStorage.setItem('signup_senha', this.senha);

    this.router.navigate(['signup-verificacao']);
  }

  public voltar(): void {
    this.router.navigate(['']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }
}

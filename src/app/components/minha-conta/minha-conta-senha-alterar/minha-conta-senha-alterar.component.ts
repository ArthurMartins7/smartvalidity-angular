import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { Empresa } from '../../../shared/model/entity/empresa';

@Component({
  selector: 'app-minha-conta-senha-alterar',
  imports: [FormsModule],
  templateUrl: './minha-conta-senha-alterar.component.html',
  styleUrl: './minha-conta-senha-alterar.component.css'
})
export class MinhaContaSenhaAlterarComponent {

  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  /**
   * Flags dos checkboxes exibidos no formulário
   */
  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  // Campos de senha da etapa 2
  public senha: string = '';
  public confirmarSenha: string = '';

  // Senha antiga (somente leitura)
  public senhaAntiga: string = 'arthur123';

  // Flags de visibilidade dos campos de senha
  public showSenhaAntiga: boolean = false;
  public showSenha: boolean = false;
  public showConfirmarSenha: boolean = false;

  private router = inject(Router);

  /**
   * Avança para a próxima etapa do cadastro.
   * Por enquanto apenas persiste as informações no sessionStorage
   * e redireciona para a etapa de criação de senha.
   */
  public alterarSenha(): void {

    if (this.senha !== this.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    // Persistir a senha (exemplo) e navegar para verificação
    sessionStorage.setItem('signup_senha', this.senha);

    this.router.navigate(['minha-conta-info']);
  }

  /**
   * Retorna para a etapa anterior (informações pessoais)
   */
  public voltar(): void {
    this.router.navigate(['']);
  }

  public toggleShowSenha(): void {
    this.showSenha = !this.showSenha;
  }

  public toggleShowConfirmarSenha(): void {
    this.showConfirmarSenha = !this.showConfirmarSenha;
  }

  public toggleShowSenhaAntiga(): void {
    this.showSenhaAntiga = !this.showSenhaAntiga;
  }

}

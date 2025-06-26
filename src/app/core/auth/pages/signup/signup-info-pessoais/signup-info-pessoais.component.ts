import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Empresa } from '../../../../../shared/model/entity/empresa';
import { Usuario } from '../../../../../shared/model/entity/usuario.model';
import { HeaderAuthComponent } from "../../../../../shared/ui/headers/header-auth/header-auth.component";

@Component({
  selector: 'app-signup-info-pessoais',
  standalone: true,
  imports: [FormsModule, HeaderAuthComponent],
  templateUrl: './signup-info-pessoais.component.html',
  styleUrl: './signup-info-pessoais.component.css'
})
export class SignupInfoPessoaisComponent {
  public usuario: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  /**
   * Flags dos checkboxes exibidos no formulário
   */
  public aceitaTermos: boolean = false;
  public receberNoticias: boolean = false;

  private router = inject(Router);

  /**
   * Avança para a próxima etapa do cadastro.
   * Por enquanto apenas persiste as informações no sessionStorage
   * e redireciona para a etapa de criação de senha.
   */
  public avancar(): void {
    if (!this.aceitaTermos) {
      // Termos de uso são obrigatórios
      alert('Você precisa aceitar os termos e condições de uso para continuar.');
      return;
    }

    // Persistir no sessionStorage para reutilizar nas próximas etapas
    sessionStorage.setItem('signup_usuario', JSON.stringify(this.usuario));
    sessionStorage.setItem('signup_empresa', JSON.stringify(this.empresa));
    sessionStorage.setItem('signup_marketing', JSON.stringify(this.receberNoticias));

    // Navegar para a próxima etapa (02. senha)
    this.router.navigate(['signup-senha']);
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPasswordRecoveryComponent } from '../../../../../shared/ui/headers/header-password-recovery/header-password-recovery.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-password-recovery-validar-identidade',
  standalone: true,
  imports: [CommonModule, HeaderPasswordRecoveryComponent],
  templateUrl: './password-recovery-validar-identidade.component.html',
  styleUrl: './password-recovery-validar-identidade.component.css'
})
export class PasswordRecoveryValidarIdentidadeComponent {

  private router = inject(Router);

  public voltar(): void {
    this.router.navigate(['/password-recovery-validar-identidade']);
  }

  public confirrmarEmail(): void {
    this.router.navigate(['/password-recovery-codigo-verificacao']);
  }

}

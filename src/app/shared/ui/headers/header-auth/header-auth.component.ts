import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-auth',
  imports: [],
  templateUrl: './header-auth.component.html',
  styleUrl: './header-auth.component.css'
})
export class HeaderAuthComponent {

  private router = inject(Router);

  irParaLogin(): void {
    this.router.navigate(['/']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./shared/ui/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'smartvalidity-angular';
  @ViewChild(SidebarComponent) sidebar?: SidebarComponent;

  private router = inject(Router);

  /**
   * Flag que indica se a rota atual é de autenticação (login / signup),
   * utilizada para esconder a sidebar e ajustar margin/padding.
   */
  public isAuthRoute = false;

  ngOnInit(): void {
    // Avaliar rota inicial
    this.updateAuthRoute(this.router.url);

    // Atualizar flag a cada navegação concluída
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateAuthRoute(event.urlAfterRedirects);
      }
    });
  }

  private updateAuthRoute(url: string): void {
    const authRoutes = ['/', '/signup-info-pessoais', '/signup-senha', '/signup-verificacao', '/signup-validar-identidade', '/password-recovery-validar-identidade', '/password-recovery-codigo-verificacao', '/password-recovery-alterar-senha'];
    this.isAuthRoute = authRoutes.includes(url);
  }

  isMobile(): boolean {
    return window.innerWidth < 768; // md breakpoint do Tailwind
  }
}

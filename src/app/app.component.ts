import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./shared/ui/sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'smartvalidity-angular';

  private router = inject(Router);

  isAuthRoute(): boolean {
    const authRoutes = ['/login', '/register'];
    return authRoutes.includes(this.router.url);
  }

}

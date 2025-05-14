import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  activeMenuItem = 'mural'; // Default active menu item
  isSidebarOpen = true; // Control sidebar visibility

  menuItems: MenuItem[] = [
    { id: 'mural', icon: 'dashboard', label: 'Mural', route: '/mural-listagem' },
    { id: 'estoque', icon: 'inventory', label: 'Estoque', route: '/entrada-estoque' },
    { id: 'layout', icon: 'grid_view', label: 'Layout', route: '/corredor' },
    { id: 'fornecedores', icon: 'business', label: 'Fornecedores', route: '/fornecedor-listagem' },
  ];

  additionalItems: MenuItem[] = [
    { id: 'notificacoes', icon: 'notifications', label: 'Notificações', route: '/notificacoes', badge: 'NOVO' },
    { id: 'aplicativos', icon: 'apps', label: 'Aplicativos', route: '/aplicativos' },
    { id: 'blog', icon: 'article', label: 'Blog', route: '/blog' },
  ];

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActive(itemId: string, route?: string): void {
    this.activeMenuItem = itemId;
    if (route) {
      this.navigateTo(route);
      // Fecha a sidebar se estiver em um dispositivo móvel
      if (this.isMobile()) {
        this.isSidebarOpen = false;
      }
    }
  }

  isActive(itemId: string): boolean {
    return this.activeMenuItem === itemId;
  }

  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  isMobile(): boolean {
    return window.innerWidth < 768; // md breakpoint do Tailwind
  }
}

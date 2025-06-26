import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../core/auth/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificacaoService } from '../../service/notificacao.service';


interface MenuItem {
  id: string;
  icon?: string;
  label: string;
  route: string;
  badge?: string;
  image?: string;
  imageActive?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeMenuItem = 'mural'; // Default active menu item
  isSidebarOpen = true; // Control sidebar visibility
  // Controls the visibility of the profile dropdown menu
  isDropdownOpen = false;
  userName: string = '';
  unreadCount: number = 0;

  menuItems: MenuItem[] = [
    { id: 'mural', image: '/icons/mural.svg', imageActive: '/icons/mural-blue.svg', label: 'Mural', route: '/mural-listagem' },
    { id: 'estoque', image: '/icons/estoque.svg', imageActive: '/icons/estoque-blue.svg', label: 'Estoque', route: '/entrada-estoque' },
    { id: 'layout', icon: 'widgets', label: 'Layout', route: '/corredor' },

  ];

  additionalItems: MenuItem[] = [
    { id: 'usuarios-perfis', icon: 'people', label: 'Usuários e Perfis', route: '/usuarios-perfis-listagem' },
    { id: 'alertas', image: '/icons/notification-settings.svg', imageActive: '/icons/notification-settings-blue.svg', label: 'Gerenciar Alertas', route: '/alertas' },
    { id: 'fornecedores', image: '/icons/fornecedor.svg', imageActive: '/icons/fornecedor-blue.svg', label: 'Fornecedores', route: '/fornecedor-listagem' },

  ];

  constructor(
    private router: Router,
              private authService: AuthenticationService,
    private notificacaoService: NotificacaoService
  ) {}

    ngOnInit(): void {
    this.userName = sessionStorage.getItem('usuarioNome') ?? 'Usuário';

    // Subscrever para atualizações de notificações não lidas
    this.notificacaoService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Atualizar contador de forma silenciosa após um pequeno delay
    setTimeout(() => {
      this.notificacaoService.atualizarContadorNaoLidas();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  goToNotifications(): void {
    this.router.navigate(['/notificacoes']);
    // O contador será atualizado automaticamente quando as notificações forem marcadas como lidas
  }

  /**
   * Verificar se há notificações não lidas
   */
  hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }

  navigateToMinhaContaInfo() {
    this.router.navigate(['minha-conta-info']);
  }

  // Toggles the profile dropdown open/close
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    // Clear stored auth data and redirect the user to the login page
    this.authService.logout();
    this.router.navigate(['']);
  }
}

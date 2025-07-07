import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-mural-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container flex border-b border-gray-200">
      <button
        class="py-2 px-4 md:py-2 md:px-4 lg:py-2 lg:px-4 font-medium flex items-center tab-button"
        [ngClass]="{
          'border-b-2 border-yellow-500 text-yellow-500': activeTab === 'proximo',
          'text-gray-500 hover:text-yellow-500': activeTab !== 'proximo'
        }"
        (click)="setActiveTab('proximo')">
        <span class="material-icons mr-1 tab-icon">schedule</span>
        <span class="tab-text">Próximos do vencimento</span>
      </button>

      <button
        class="py-2 px-4 md:py-2 md:px-4 lg:py-2 lg:px-4 font-medium flex items-center tab-button"
        [ngClass]="{
          'border-b-2 border-red-500 text-red-500': activeTab === 'hoje',
          'text-gray-500 hover:text-red-500': activeTab !== 'hoje'
        }"
        (click)="setActiveTab('hoje')">
        <span class="material-icons mr-1 tab-icon">event</span>
        <span class="tab-text">Vencem hoje</span>
      </button>

      <button
        class="py-2 px-4 md:py-2 md:px-4 lg:py-2 lg:px-4 font-medium flex items-center tab-button"
        [ngClass]="{
          'border-b-2 border-black text-black': activeTab === 'vencido',
          'text-gray-500 hover:text-black': activeTab !== 'vencido'
        }"
        (click)="setActiveTab('vencido')">
        <span class="material-icons mr-1 tab-icon">warning</span>
        <span class="tab-text">Vencidos</span>
      </button>
    </div>
  `,
  styles: [`
    .tabs-container {
      padding-bottom: 1px;
    }

    .tabs-container button {
      position: relative;
      transition: all 0.2s ease;
    }

    .material-icons {
      font-size: 20px;
    }

    /* Resposta visual no hover */
    .tabs-container button:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    /* Acessibilidade - outline para navegação por teclado */
    .tabs-container button:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }

    /* Animação sutil na transição de abas */
    .tabs-container button {
      border-bottom-width: 0;
      transition: border-bottom-width 0.3s, color 0.3s;
    }

    .tabs-container button.active {
      border-bottom-width: 2px;
    }

    /* Otimização para Samsung S20 Ultra e mobile */
    @media (max-width: 420px) {
      .tab-button {
        padding: 0.5rem 0.375rem !important;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .tab-icon {
        font-size: 16px !important;
        margin-right: 0.25rem;
      }
      
      .tab-text {
        font-size: 0.75rem;
        line-height: 1.2;
      }
      
      .tabs-container {
        gap: 0.25rem;
      }
    }

    /* Breakpoint específico para Samsung S20 Ultra (412px) */
    @media (max-width: 412px) {
      .tab-button {
        padding: 0.4rem 0.3rem !important;
        font-size: 0.7rem;
      }
      
      .tab-icon {
        font-size: 14px !important;
        margin-right: 0.2rem;
      }
      
      .tab-text {
        font-size: 0.7rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    /* Responsividade para tablets */
    @media (min-width: 421px) and (max-width: 1023px) {
      .tab-button {
        padding: 0.6rem 0.75rem !important;
        font-size: 0.8rem;
      }
      
      .tab-icon {
        font-size: 18px !important;
      }
      
      .tab-text {
        font-size: 0.8rem;
      }
    }
  `]
})
export class MuralTabsComponent {
  @Input() activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';
  @Output() tabChange = new EventEmitter<'proximo' | 'hoje' | 'vencido'>();

  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.tabChange.emit(tab);
    }
  }
}

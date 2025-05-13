import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-mural-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container flex border-b border-gray-200">
      <button
        class="py-2 px-4 font-medium flex items-center"
        [ngClass]="{
          'border-b-2 border-yellow-500 text-yellow-500': activeTab === 'proximo',
          'text-gray-500 hover:text-yellow-500': activeTab !== 'proximo'
        }"
        (click)="setActiveTab('proximo')">
        <span class="material-icons mr-1">schedule</span>
        <span>Próximos do vencimento</span>
      </button>

      <button
        class="py-2 px-4 font-medium flex items-center"
        [ngClass]="{
          'border-b-2 border-red-500 text-red-500': activeTab === 'hoje',
          'text-gray-500 hover:text-red-500': activeTab !== 'hoje'
        }"
        (click)="setActiveTab('hoje')">
        <span class="material-icons mr-1">event</span>
        <span>Vencem hoje</span>
      </button>

      <button
        class="py-2 px-4 font-medium flex items-center"
        [ngClass]="{
          'border-b-2 border-black text-black': activeTab === 'vencido',
          'text-gray-500 hover:text-black': activeTab !== 'vencido'
        }"
        (click)="setActiveTab('vencido')">
        <span class="material-icons mr-1">warning</span>
        <span>Vencidos</span>
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
  `]
})
export class MuralTabsComponent {
  @Input() activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';
  @Output() tabChange = new EventEmitter<'proximo' | 'hoje' | 'vencido'>();

  /**
   * Define a aba ativa e emite o evento de mudança para o componente pai
   */
  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.tabChange.emit(tab);
    }
  }
}

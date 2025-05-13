import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtro-basico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-basico.component.html',
  styleUrls: ['./filtro-basico.component.css']
})
export class FiltroBasicoComponent {
  @Input() searchTerm: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() hasSelectedItems: boolean = false;
  @Input() selectedItemsCount: number = 0;

  @Output() searchChange = new EventEmitter<string>();
  @Output() toggleSort = new EventEmitter<void>();
  @Output() openFilterModal = new EventEmitter<void>();
  @Output() inspectSelected = new EventEmitter<void>();

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }

  onToggleSort(): void {
    this.toggleSort.emit();
  }

  onOpenFilterModal(): void {
    this.openFilterModal.emit();
  }

  onInspectSelected(): void {
    this.inspectSelected.emit();
  }
}

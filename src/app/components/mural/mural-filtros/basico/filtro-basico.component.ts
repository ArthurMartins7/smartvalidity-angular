import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-filtro-basico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-basico.component.html',
  styleUrls: ['./filtro-basico.component.css']
})
export class FiltroBasicoComponent implements OnDestroy, OnInit {
  @Input() searchTerm: string = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() sortField: string = '';
  @Input() hasSelectedItems: boolean = false;
  @Input() selectedItemsCount: number = 0;

  showSortOptions: boolean = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  @Output() searchChange = new EventEmitter<string>();
  @Output() toggleSort = new EventEmitter<void>();
  @Output() openFilterModal = new EventEmitter<void>();
  @Output() inspectSelected = new EventEmitter<void>();
  @Output() sortOptionSelected = new EventEmitter<{field: string, direction: 'asc' | 'desc'}>();
  @Output() gerarRelatorio = new EventEmitter<void>();

  ngOnInit(): void {
    // Configurar observador de busca com debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      // Só emite a mudança se tem pelo menos 3 caracteres ou está vazio (para limpar)
      if (!term || term.trim().length === 0 || term.trim().length >= 3) {
        this.searchChange.emit(term);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onToggleSort(): void {
    this.toggleSort.emit();
  }

  toggleSortOptions(): void {
    this.showSortOptions = !this.showSortOptions;
  }

  getSortLabel(): string {
    if (this.sortField === 'dataVencimento') {
      return this.sortDirection === 'asc'
        ? 'Mais próximo do vencimento'
        : 'Mais distante do vencimento';
    }

    return 'Ordenar por vencimento';
  }

  onSelectSortOption(field: string, direction: 'asc' | 'desc'): void {
    if (field === 'dataVencimento') {
      this.sortOptionSelected.emit({
        field: field,
        direction: direction
      });
    } else {
      this.sortOptionSelected.emit({field, direction});
    }
    this.showSortOptions = false;
  }

  onOpenFilterModal(): void {
    this.openFilterModal.emit();
  }

  onInspectSelected(): void {
    this.inspectSelected.emit();
  }

  onGerarRelatorio(): void {
    this.gerarRelatorio.emit();
  }
}

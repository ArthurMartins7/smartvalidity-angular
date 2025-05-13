import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MuralFilter, MuralFilterService } from '../../../../services/mural-filter.service';

@Component({
  selector: 'app-filtro-tags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filtro-tags.component.html',
  styleUrls: ['./filtro-tags.component.css']
})
export class FiltroTagsComponent {
  @Output() clearFilter = new EventEmitter<string>();
  @Output() clearDateFilter = new EventEmitter<void>();
  @Output() resetAllFilters = new EventEmitter<void>();

  constructor(public filterService: MuralFilterService) {}

  onClearFilter(filterName: keyof MuralFilter): void {
    this.clearFilter.emit(filterName as string);
  }

  onClearDateFilter(): void {
    this.clearDateFilter.emit();
  }

  onResetAllFilters(): void {
    this.resetAllFilters.emit();
  }

  hasAppliedFilters(): boolean {
    return this.filterService.hasAppliedFilters();
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MuralFilter, MuralFilterService } from '../../../../shared/service/mural.service';


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
  @Output() clearSpecificDateFilter = new EventEmitter<string>();
  @Output() resetAllFilters = new EventEmitter<void>();
  @Output() removeFilterValue = new EventEmitter<{filterName: string, value: string}>();

  constructor(public filterService: MuralFilterService) {}

  onClearFilter(filterName: keyof MuralFilter): void {
    this.clearFilter.emit(filterName as string);
  }

  onClearDateFilter(): void {
    this.clearDateFilter.emit();
  }

  onClearSpecificDateFilter(dateType: string): void {
    this.clearSpecificDateFilter.emit(dateType);
  }

  onResetAllFilters(): void {
    this.resetAllFilters.emit();
  }

  onRemoveFilterValue(filterName: string, value: string): void {
    this.removeFilterValue.emit({filterName, value});
  }

  hasAppliedFilters(): boolean {
    return this.filterService.hasAdvancedFilters();
  }

  getAppliedDateFilters() {
    return this.filterService.getAppliedDateFilters();
  }
}

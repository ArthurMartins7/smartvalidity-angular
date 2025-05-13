import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MuralFilter {
  corredor: string;
  categoria: string;
  fornecedor: string;
  marca: string;
  lote: string;
  dataVencimento: {
    startDate: string | null;
    endDate: string | null;
  };
  dataFabricacao?: {
    startDate: string | null;
    endDate: string | null;
  };
  dataRecebimento?: {
    startDate: string | null;
    endDate: string | null;
  };
  inspecionado: boolean | null;
}

export interface MuralFilterOptions {
  availableBrands: string[];
  availableCorredores: string[];
  availableCategorias: string[];
  availableFornecedores: string[];
  availableLotes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MuralFilterService {
  // Estado inicial dos filtros
  private initialFilter: MuralFilter = {
    corredor: '',
    categoria: '',
    fornecedor: '',
    marca: '',
    lote: '',
    dataVencimento: { startDate: null, endDate: null },
    inspecionado: null
  };

  // Subjects para estado reativo
  private filtersSubject = new BehaviorSubject<MuralFilter>({...this.initialFilter});
  private searchTermSubject = new BehaviorSubject<string>('');
  private filterOptionsSubject = new BehaviorSubject<MuralFilterOptions>({
    availableBrands: [],
    availableCorredores: [],
    availableCategorias: [],
    availableFornecedores: [],
    availableLotes: []
  });

  // Observables públicos
  filters$ = this.filtersSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  filterOptions$ = this.filterOptionsSubject.asObservable();

  constructor() {}

  // Métodos para atualizar filtros
  updateFilters(filters: Partial<MuralFilter>): void {
    this.filtersSubject.next({
      ...this.filtersSubject.value,
      ...filters
    });
  }

  resetFilters(): void {
    this.filtersSubject.next({...this.initialFilter});
    this.searchTermSubject.next('');
  }

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  updateFilterOptions(options: Partial<MuralFilterOptions>): void {
    this.filterOptionsSubject.next({
      ...this.filterOptionsSubject.value,
      ...options
    });
  }

  // Limpar um filtro específico
  clearFilter(filterName: keyof MuralFilter): void {
    if (filterName in this.initialFilter) {
      const update = { [filterName]: this.initialFilter[filterName] } as Partial<MuralFilter>;
      this.updateFilters(update);
    }
  }

  // Limpar filtro de data
  clearDateFilter(dateFieldName: keyof MuralFilter): void {
    if (dateFieldName === 'dataVencimento' || dateFieldName === 'dataFabricacao' || dateFieldName === 'dataRecebimento') {
      const update = { [dateFieldName]: { startDate: null, endDate: null } } as Partial<MuralFilter>;
      this.updateFilters(update);
    }
  }

  // Obter o valor atual dos filtros
  getCurrentFilters(): MuralFilter {
    return this.filtersSubject.value;
  }

  // Verifica se há filtros aplicados
  hasAppliedFilters(): boolean {
    const currentFilters = this.filtersSubject.value;
    return (
      !!currentFilters.marca ||
      !!currentFilters.corredor ||
      !!currentFilters.categoria ||
      !!currentFilters.fornecedor ||
      !!currentFilters.lote ||
      currentFilters.inspecionado !== null ||
      !!currentFilters.dataVencimento.startDate ||
      !!currentFilters.dataVencimento.endDate
    );
  }
}

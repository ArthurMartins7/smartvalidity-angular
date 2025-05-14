import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MuralFiltroDTO, MuralListagemDTO } from '../model/dto/mural.dto';

//-----------------------------------------------------------------------
// INTERFACES
//-----------------------------------------------------------------------

/**
 * Interface para opções de filtro disponíveis
 */
export interface FiltroOpcoes {
  marcas: string[];
  corredores: string[];
  categorias: string[];
  fornecedores: string[];
  lotes: string[];
}

/**
 * Interface para o estado do filtro aplicado
 */
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

/**
 * Interface para opções de filtro
 */
export interface MuralFilterOptions {
  availableBrands: string[];
  availableCorredores: string[];
  availableCategorias: string[];
  availableFornecedores: string[];
  availableLotes: string[];
}

//-----------------------------------------------------------------------
// SERVIÇO DE API: Comunicação com o backend
//-----------------------------------------------------------------------
@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private readonly API = 'http://localhost:8080/smartvalidity/mural';

  constructor(private httpClient: HttpClient) { }

  /**
   * Obtém produtos próximos a vencer
   */
  getProximosVencer(): Observable<MuralListagemDTO[]> {
    return this.httpClient.get<MuralListagemDTO[]>(`${this.API}/proximos-vencer`);
  }

  /**
   * Obtém produtos que vencem hoje
   */
  getVencemHoje(): Observable<MuralListagemDTO[]> {
    return this.httpClient.get<MuralListagemDTO[]>(`${this.API}/vencem-hoje`);
  }

  /**
   * Obtém produtos já vencidos
   */
  getVencidos(): Observable<MuralListagemDTO[]> {
    return this.httpClient.get<MuralListagemDTO[]>(`${this.API}/vencidos`);
  }

  /**
   * Marca um item como inspecionado
   */
  marcarInspecionado(id: string, motivo?: string): Observable<MuralListagemDTO> {
    return this.httpClient.put<MuralListagemDTO>(`${this.API}/inspecionar/${id}`, motivo ? { motivo } : {});
  }

  /**
   * Marca vários itens como inspecionados
   */
  marcarVariosInspecionados(ids: string[], motivo?: string): Observable<MuralListagemDTO[]> {
    return this.httpClient.put<MuralListagemDTO[]>(`${this.API}/inspecionar-lote`, { ids, motivo });
  }

  /**
   * Obtém detalhes de um item específico
   */
  getItemById(id: string): Observable<MuralListagemDTO> {
    return this.httpClient.get<MuralListagemDTO>(`${this.API}/item/${id}`);
  }

  /**
   * Busca produtos com filtros aplicados no backend
   */
  filtrarProdutos(filtro: MuralFiltroDTO): Observable<MuralListagemDTO[]> {
    return this.httpClient.post<MuralListagemDTO[]>(`${this.API}/filtrar`, filtro);
  }

  /**
   * Obtém opções de valores para filtros
   */
  getOpcoesFiltro(): Observable<FiltroOpcoes> {
    return this.httpClient.get<FiltroOpcoes>(`${this.API}/filtro-opcoes`);
  }
}

//-----------------------------------------------------------------------
// SERVIÇO DE FILTROS: Gerencia o estado dos filtros aplicados
//-----------------------------------------------------------------------
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
  private sortFieldSubject = new BehaviorSubject<string>('');
  private sortDirectionSubject = new BehaviorSubject<'asc' | 'desc'>('asc');

  // Observables públicos
  filters$ = this.filtersSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  filterOptions$ = this.filterOptionsSubject.asObservable();
  sortField$ = this.sortFieldSubject.asObservable();
  sortDirection$ = this.sortDirectionSubject.asObservable();

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

  updateSortField(field: string): void {
    this.sortFieldSubject.next(field);
  }

  updateSortDirection(direction: 'asc' | 'desc'): void {
    this.sortDirectionSubject.next(direction);
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

  // Converte o modelo de filtro interno para o DTO que será enviado para o backend
  toFilterDTO(): MuralFiltroDTO {
    const filter = this.getCurrentFilters();
    const searchTerm = this.searchTermSubject.value;
    const sortBy = this.sortFieldSubject.value;
    const sortDirection = this.sortDirectionSubject.value;

    // Se o campo de ordenação for 'nome', precisamos mapear para 'descricao' no backend
    const mappedSortBy = sortBy === 'nome' ? 'descricao' : sortBy;

    return {
      corredor: filter.corredor || undefined,
      categoria: filter.categoria || undefined,
      fornecedor: filter.fornecedor || undefined,
      marca: filter.marca || undefined,
      lote: filter.lote || undefined,
      dataVencimentoInicio: filter.dataVencimento.startDate || undefined,
      dataVencimentoFim: filter.dataVencimento.endDate || undefined,
      dataFabricacaoInicio: filter.dataFabricacao?.startDate || undefined,
      dataFabricacaoFim: filter.dataFabricacao?.endDate || undefined,
      dataRecebimentoInicio: filter.dataRecebimento?.startDate || undefined,
      dataRecebimentoFim: filter.dataRecebimento?.endDate || undefined,
      inspecionado: filter.inspecionado,
      searchTerm: searchTerm || undefined,
      sortBy: mappedSortBy || undefined,
      sortDirection: sortDirection,
      status: undefined
    };
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

//-----------------------------------------------------------------------
// SERVIÇO DE SELEÇÃO: Gerencia a seleção de itens e modal de inspeção
//-----------------------------------------------------------------------
@Injectable({
  providedIn: 'root'
})
export class MuralSelecaoService {
  private selectedItemsSubject = new BehaviorSubject<string[]>([]);
  private showInspecaoModalSubject = new BehaviorSubject<boolean>(false);
  private motivoInspecaoSubject = new BehaviorSubject<string>('');
  private motivoInspecaoErrorSubject = new BehaviorSubject<string | null>(null);

  // Opções de motivos de inspeção
  readonly motivosInspecao: string[] = ['Avaria/Quebra', 'Promoção'];

  // Observables públicos
  selectedItems$: Observable<string[]> = this.selectedItemsSubject.asObservable();
  showInspecaoModal$: Observable<boolean> = this.showInspecaoModalSubject.asObservable();
  motivoInspecao$: Observable<string> = this.motivoInspecaoSubject.asObservable();
  motivoInspecaoError$: Observable<string | null> = this.motivoInspecaoErrorSubject.asObservable();

  constructor(private muralService: MuralService) { }

  // Atualiza os itens selecionados
  updateSelectedItems(items: string[]): void {
    this.selectedItemsSubject.next(items);
  }

  // Seleciona ou desmarca todos os itens
  selectAll(items: MuralListagemDTO[], selected: boolean): void {
    const ids = selected ?
      items.map(item => item.id) :
      [];
    this.selectedItemsSubject.next(ids);
  }

  // Alterna a seleção de um item
  toggleItemSelection(item: MuralListagemDTO, selected: boolean): void {
    const currentItems = [...this.selectedItemsSubject.value];

    if (selected && !currentItems.includes(item.id)) {
      currentItems.push(item.id);
    } else if (!selected) {
      const index = currentItems.indexOf(item.id);
      if (index > -1) {
        currentItems.splice(index, 1);
      }
    }

    this.selectedItemsSubject.next(currentItems);
  }

  // Verifica se há itens selecionados
  hasSelectedItems(): boolean {
    return this.selectedItemsSubject.value.length > 0;
  }

  // Retorna o número de itens selecionados
  getSelectedItemsCount(): number {
    return this.selectedItemsSubject.value.length;
  }

  // Retorna os itens selecionados a partir de uma lista de todos os itens
  getSelectedItems(allItems: MuralListagemDTO[] = []): MuralListagemDTO[] {
    const selectedIds = this.getSelectedIds();
    if (allItems && allItems.length > 0) {
      return allItems.filter(item => selectedIds.includes(item.id));
    }
    return [];
  }

  // Controle do modal de inspeção
  openInspecaoModal(): void {
    if (!this.hasSelectedItems()) return;

    this.motivoInspecaoSubject.next('');
    this.motivoInspecaoErrorSubject.next(null);
    this.showInspecaoModalSubject.next(true);
  }

  closeInspecaoModal(): void {
    this.showInspecaoModalSubject.next(false);
    this.motivoInspecaoSubject.next('');
    this.motivoInspecaoErrorSubject.next(null);
  }

  selecionarMotivo(motivo: string): void {
    this.motivoInspecaoSubject.next(motivo);
    this.motivoInspecaoErrorSubject.next(null);
  }

  // Confirma a inspeção para os itens selecionados
  confirmarInspecao(items: MuralListagemDTO[]): Observable<MuralListagemDTO[]> {
    const motivoInspecao = this.motivoInspecaoSubject.value;
    const selectedIds = this.selectedItemsSubject.value;

    if (!motivoInspecao) {
      this.motivoInspecaoErrorSubject.next('Por favor, selecione um motivo para a inspeção.');
      throw new Error('Motivo de inspeção não selecionado');
    }

    return this.muralService.marcarVariosInspecionados(selectedIds, motivoInspecao);
  }

  // Limpa a seleção
  clearSelection(): void {
    this.selectedItemsSubject.next([]);
  }

  // Obtém os IDs dos itens selecionados
  getSelectedIds(): string[] {
    return this.selectedItemsSubject.value;
  }
}

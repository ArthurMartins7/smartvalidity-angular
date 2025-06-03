import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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
  inspecionado: boolean | undefined;
  motivoInspecao: string;
  usuarioInspecao: string;
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
  availableUsuariosInspecao: string[];
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
   * Obtém o nome do usuário atualmente logado
   * @returns O nome do usuário ou 'Sistema' caso não esteja disponível
   */
  private getUsuarioAtual(): string {
    const nome = sessionStorage.getItem('usuarioNome');
    return nome || 'Sistema';
  }

  /**
   * Marca um item como inspecionado
   */
  marcarInspecionado(id: string, motivo: string, motivoCustomizado?: string): Observable<MuralListagemDTO> {
    const payload: any = {
      motivo: motivo,
      usuarioInspecao: this.getUsuarioAtual()
    };
    if (motivo === 'Outro') {
      payload.motivoCustomizado = motivoCustomizado || '';
    }
    return this.httpClient.put<MuralListagemDTO>(`${this.API}/inspecionar/${id}`, payload);
  }

  /**
   * Marca vários itens como inspecionados
   */
  marcarVariosInspecionados(ids: string[], motivo: string, motivoCustomizado?: string): Observable<MuralListagemDTO[]> {
    const payload: any = {
      ids: ids,
      motivo: motivo,
      usuarioInspecao: this.getUsuarioAtual()
    };
    if (motivo === 'Outro') {
      payload.motivoCustomizado = motivoCustomizado || '';
    }
    return this.httpClient.put<MuralListagemDTO[]>(`${this.API}/inspecionar-lote`, payload);
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

  /**
   * Obtém lista de usuários para filtro
   */
  getUsuarios(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.API}/usuarios-inspecao`);
  }

  /**
   * Obtém o número total de páginas com base no filtro
   */
  contarPaginas(filtro: MuralFiltroDTO): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/contar-paginas`, filtro);
  }

  /**
   * Obtém o número total de registros com base no filtro
   */
  contarTotalRegistros(filtro: MuralFiltroDTO): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/contar-registros`, filtro);
  }

  buscarPorIds(ids: string[]): Observable<MuralListagemDTO[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }
    return this.httpClient.post<MuralListagemDTO[]>(`${this.API}/buscar-por-ids`, ids);
  }

  cancelarSelecao(ids: string[]): Observable<any> {
    return this.httpClient.post(`${this.API}/cancelar-selecao`, ids);
  }
}

//-----------------------------------------------------------------------
// SERVIÇO DE FILTROS: Gerencia o estado dos filtros aplicados
//-----------------------------------------------------------------------
@Injectable({
  providedIn: 'root'
})
export class MuralFilterService {
  private readonly API = 'http://localhost:8080/smartvalidity/mural';
  private readonly FILTER_STATE_KEY = 'muralFilterState';

  // Estado inicial dos filtros
  private initialFilter: MuralFilter = {
    corredor: '',
    categoria: '',
    fornecedor: '',
    marca: '',
    lote: '',
    dataVencimento: { startDate: null, endDate: null },
    dataFabricacao: { startDate: null, endDate: null },
    dataRecebimento: { startDate: null, endDate: null },
    inspecionado: undefined,
    motivoInspecao: '',
    usuarioInspecao: ''
  };

  // Subjects para estado reativo
  private filtersSubject = new BehaviorSubject<MuralFilter>(this.loadFilterState());
  private searchTermSubject = new BehaviorSubject<string>(this.loadSearchTerm());
  private filterOptionsSubject = new BehaviorSubject<MuralFilterOptions>({
    availableBrands: [],
    availableCorredores: [],
    availableCategorias: [],
    availableFornecedores: [],
    availableLotes: [],
    availableUsuariosInspecao: []
  });
  private sortFieldSubject = new BehaviorSubject<string>(this.loadSortField());
  private sortDirectionSubject = new BehaviorSubject<'asc' | 'desc'>(this.loadSortDirection());
  private inspecaoFilterSubject = new BehaviorSubject<'todos' | 'inspecionados' | 'naoInspecionados'>(this.loadInspecaoFilter());

  // Observables públicos
  filters$ = this.filtersSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  filterOptions$ = this.filterOptionsSubject.asObservable();
  sortField$ = this.sortFieldSubject.asObservable();
  sortDirection$ = this.sortDirectionSubject.asObservable();
  inspecaoFilter$ = this.inspecaoFilterSubject.asObservable();

  // Serviço de filtros: Adicionar propriedades para paginação
  private paginaAtualSubject = new BehaviorSubject<number>(1);
  private itensPorPaginaSubject = new BehaviorSubject<number>(10);
  private totalPaginasSubject = new BehaviorSubject<number>(1);

  // Observables públicos para paginação
  paginaAtual$ = this.paginaAtualSubject.asObservable();
  itensPorPagina$ = this.itensPorPaginaSubject.asObservable();
  totalPaginas$ = this.totalPaginasSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

  // Métodos para atualizar filtros
  updateFilters(filters: Partial<MuralFilter>): void {
    const newFilters = {
      ...this.filtersSubject.value,
      ...filters
    };
    this.filtersSubject.next(newFilters);
    this.saveFilterState();
  }

  updateSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
    this.saveFilterState();
  }

  updateFilterOptions(options: Partial<MuralFilterOptions>): void {
    this.filterOptionsSubject.next({
      ...this.filterOptionsSubject.value,
      ...options
    });
  }

  updateSortField(field: string): void {
    this.sortFieldSubject.next(field);
    this.saveFilterState();
  }

  updateSortDirection(direction: 'asc' | 'desc'): void {
    this.sortDirectionSubject.next(direction);
    this.saveFilterState();
  }

  // Limpar um filtro específico
  clearFilter(filterName: keyof MuralFilter): void {
    if (filterName === 'dataVencimento') {
      this.filtersSubject.next({
        ...this.filtersSubject.value,
        dataVencimento: { startDate: null, endDate: null }
      });
    } else if (filterName === 'inspecionado') {
      this.filtersSubject.next({
        ...this.filtersSubject.value,
        inspecionado: undefined
      });
    } else if (filterName === 'motivoInspecao') {
      this.filtersSubject.next({
        ...this.filtersSubject.value,
        motivoInspecao: ''
      });
    } else if (filterName === 'usuarioInspecao') {
      this.filtersSubject.next({
        ...this.filtersSubject.value,
        usuarioInspecao: ''
      });
    } else {
      this.filtersSubject.next({
        ...this.filtersSubject.value,
        [filterName]: ''
      });
    }
  }

  // Limpar filtro de data
  clearDateFilter(dateFieldName: keyof MuralFilter): void {
    const currentFilters = this.filtersSubject.value;
    if (dateFieldName === 'dataVencimento' || dateFieldName === 'dataFabricacao' || dateFieldName === 'dataRecebimento') {
      if (dateFieldName === 'dataVencimento') {
        currentFilters[dateFieldName] = { startDate: null, endDate: null };
      } else {
        currentFilters[dateFieldName] = undefined;
      }
    }
    this.filtersSubject.next(currentFilters);
  }

  // Obter o valor atual dos filtros
  getCurrentFilters(): MuralFilter {
    return this.filtersSubject.value;
  }

  /**
   * Converte o modelo de filtro interno para o DTO que será enviado para o backend
   */
  toFilterDTO(): MuralFiltroDTO {
    const currentFilters = this.filtersSubject.value;
    const searchTerm = this.searchTermSubject.value;
    const sortField = this.sortFieldSubject.value;
    const sortDirection = this.sortDirectionSubject.value;
    const paginaAtual = this.paginaAtualSubject.value;
    const itensPorPagina = this.itensPorPaginaSubject.value;

    const convertDate = (dateStr: string | null | undefined): string | undefined => {
      if (!dateStr) return undefined;
      const date = new Date(dateStr);
      return date.toISOString();
    };

    return {
      corredor: currentFilters.corredor || undefined,
      categoria: currentFilters.categoria || undefined,
      fornecedor: currentFilters.fornecedor || undefined,
      marca: currentFilters.marca || undefined,
      lote: currentFilters.lote || undefined,
      dataVencimentoInicio: convertDate(currentFilters.dataVencimento?.startDate),
      dataVencimentoFim: convertDate(currentFilters.dataVencimento?.endDate),
      dataFabricacaoInicio: convertDate(currentFilters.dataFabricacao?.startDate),
      dataFabricacaoFim: convertDate(currentFilters.dataFabricacao?.endDate),
      dataRecebimentoInicio: convertDate(currentFilters.dataRecebimento?.startDate),
      dataRecebimentoFim: convertDate(currentFilters.dataRecebimento?.endDate),
      inspecionado: currentFilters.inspecionado,
      motivoInspecao: currentFilters.motivoInspecao || undefined,
      usuarioInspecao: currentFilters.usuarioInspecao || undefined,
      searchTerm: searchTerm || undefined,
      sortBy: sortField || undefined,
      sortDirection: sortDirection || undefined,
      pagina: paginaAtual,
      limite: itensPorPagina
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
      currentFilters.inspecionado !== undefined ||
      !!currentFilters.dataVencimento?.startDate ||
      !!currentFilters.dataVencimento?.endDate ||
      !!currentFilters.dataFabricacao?.startDate ||
      !!currentFilters.dataFabricacao?.endDate ||
      !!currentFilters.dataRecebimento?.startDate ||
      !!currentFilters.dataRecebimento?.endDate ||
      !!currentFilters.motivoInspecao ||
      !!currentFilters.usuarioInspecao
    );
  }

  // Métodos para gerenciar paginação
  updatePaginaAtual(pagina: number): void {
    this.paginaAtualSubject.next(pagina);
  }

  updateItensPorPagina(itens: number): void {
    this.itensPorPaginaSubject.next(itens);
    // Reset para a primeira página quando muda o número de itens
    this.paginaAtualSubject.next(1);
  }

  updateTotalPaginas(total: number): void {
    this.totalPaginasSubject.next(total);
  }

  // Carrega as opções disponíveis para os filtros
  loadFilterOptions(): void {
    // Carregar opções de filtro do backend
    this.httpClient.get<FiltroOpcoes>(`${this.API}/filtro-opcoes`).subscribe({
      next: (opcoes) => {
        this.updateFilterOptions({
          availableBrands: opcoes.marcas,
          availableCorredores: opcoes.corredores,
          availableCategorias: opcoes.categorias,
          availableFornecedores: opcoes.fornecedores,
          availableLotes: opcoes.lotes
        });
      },
      error: (error) => {
        console.error('Erro ao carregar opções de filtro:', error);
        this.updateFilterOptions({
          availableBrands: [],
          availableCorredores: [],
          availableCategorias: [],
          availableFornecedores: [],
          availableLotes: []
        });
      }
    });

    // Carregar lista de usuários independentemente do resultado das outras opções
    this.httpClient.get<string[]>(`${this.API}/usuarios-inspecao`).subscribe({
      next: (usuarios) => {
        this.updateFilterOptions({
          availableUsuariosInspecao: usuarios
        });
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.updateFilterOptions({
          availableUsuariosInspecao: []
        });
      }
    });
  }

  // Métodos para persistência do estado
  private saveFilterState(): void {
    const state = {
      filters: this.filtersSubject.value,
      searchTerm: this.searchTermSubject.value,
      sortField: this.sortFieldSubject.value,
      sortDirection: this.sortDirectionSubject.value,
      paginaAtual: this.paginaAtualSubject.value,
      itensPorPagina: this.itensPorPaginaSubject.value,
      inspecaoFilter: this.inspecaoFilterSubject.value,
      lastUpdated: new Date().toISOString()
    };
    try {
      sessionStorage.setItem(this.FILTER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Erro ao salvar estado dos filtros:', error);
    }
  }

  private loadFilterState(): MuralFilter {
    try {
      const stateStr = sessionStorage.getItem(this.FILTER_STATE_KEY);
      if (stateStr) {
        const state = JSON.parse(stateStr);
        if (state.filters &&
            typeof state.filters === 'object' &&
            'dataVencimento' in state.filters) {
          return state.filters;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estado dos filtros:', error);
    }
    return {...this.initialFilter};
  }

  private loadSearchTerm(): string {
    const stateStr = sessionStorage.getItem(this.FILTER_STATE_KEY);
    if (stateStr) {
      try {
        const state = JSON.parse(stateStr);
        return state.searchTerm || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  private loadSortField(): string {
    const stateStr = sessionStorage.getItem(this.FILTER_STATE_KEY);
    if (stateStr) {
      try {
        const state = JSON.parse(stateStr);
        return state.sortField || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  private loadSortDirection(): 'asc' | 'desc' {
    const stateStr = sessionStorage.getItem(this.FILTER_STATE_KEY);
    if (stateStr) {
      try {
        const state = JSON.parse(stateStr);
        return state.sortDirection || 'asc';
      } catch {
        return 'asc';
      }
    }
    return 'asc';
  }

  // Métodos para o filtro de inspeção
  updateInspecaoFilter(status: 'todos' | 'inspecionados' | 'naoInspecionados'): void {
    this.inspecaoFilterSubject.next(status);
    this.saveFilterState();
  }

  getInspecaoFilter(): 'todos' | 'inspecionados' | 'naoInspecionados' {
    return this.inspecaoFilterSubject.value;
  }

  private loadInspecaoFilter(): 'todos' | 'inspecionados' | 'naoInspecionados' {
    try {
      const stateStr = sessionStorage.getItem(this.FILTER_STATE_KEY);
      if (stateStr) {
        const state = JSON.parse(stateStr);
        if (state.inspecaoFilter &&
            ['todos', 'inspecionados', 'naoInspecionados'].includes(state.inspecaoFilter)) {
          return state.inspecaoFilter;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estado do filtro de inspeção:', error);
    }
    return 'todos';
  }

  resetFilters(): void {
    this.filtersSubject.next({...this.initialFilter});
    this.searchTermSubject.next('');
    this.sortFieldSubject.next('');
    this.sortDirectionSubject.next('asc');
    this.paginaAtualSubject.next(1);
    this.itensPorPaginaSubject.next(10);
    this.inspecaoFilterSubject.next('todos');
    sessionStorage.removeItem(this.FILTER_STATE_KEY);
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
  private showAcoesModalSubject = new BehaviorSubject<boolean>(false);
  private motivoInspecaoSubject = new BehaviorSubject<string>('');
  private motivoInspecaoErrorSubject = new BehaviorSubject<string | null>(null);
  private motivoCustomizadoSubject = new BehaviorSubject<string>('');
  private totalItensAbaSubject = new BehaviorSubject<number>(0);

  // Opções de motivos de inspeção
  readonly motivosInspecao: string[] = ['Avaria/Quebra', 'Promoção', 'Outro'];

  // Observables públicos
  selectedItems$: Observable<string[]> = this.selectedItemsSubject.asObservable();
  showInspecaoModal$: Observable<boolean> = this.showInspecaoModalSubject.asObservable();
  showAcoesModal$: Observable<boolean> = this.showAcoesModalSubject.asObservable();
  motivoInspecao$: Observable<string> = this.motivoInspecaoSubject.asObservable();
  motivoInspecaoError$: Observable<string | null> = this.motivoInspecaoErrorSubject.asObservable();
  motivoCustomizado$: Observable<string> = this.motivoCustomizadoSubject.asObservable();
  totalItensAba$: Observable<number> = this.totalItensAbaSubject.asObservable();

  constructor(private muralService: MuralService) { }

  // Atualiza os itens selecionados
  updateSelectedItems(items: string[]): void {
    this.selectedItemsSubject.next(items);
  }

  // Seleciona ou desmarca todos os itens da página
  selectAll(items: MuralListagemDTO[], selected: boolean): void {
    const current = new Set(this.selectedItemsSubject.value);
    const pageIds = items.map(item => item.id);
    if (selected) {
      pageIds.forEach(id => current.add(id));
    } else {
      pageIds.forEach(id => current.delete(id));
    }
    this.selectedItemsSubject.next(Array.from(current));
  }

  // Seleciona todos os itens da aba atual
  selectAllInTab(totalItens: number): void {
    this.totalItensAbaSubject.next(totalItens);
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

  // Retorna o total de itens na aba atual
  getTotalItensAba(): number {
    return this.totalItensAbaSubject.value;
  }

  // Retorna os itens selecionados
  getSelectedItems(): Observable<MuralListagemDTO[]> {
    return this.muralService.buscarPorIds(this.selectedItemsSubject.value);
  }

  // Controle do modal de inspeção
  openInspecaoModal(): void {
    if (!this.hasSelectedItems()) return;
    // Fecha o modal de ações se estiver aberto
    this.closeAcoesModal();
    this.motivoInspecaoSubject.next('');
    this.motivoInspecaoErrorSubject.next(null);
    this.showInspecaoModalSubject.next(true);
  }

  closeInspecaoModal(): void {
    this.showInspecaoModalSubject.next(false);
    this.motivoInspecaoSubject.next('');
    this.motivoCustomizadoSubject.next('');
    this.motivoInspecaoErrorSubject.next(null);
  }

  selecionarMotivo(motivo: string): void {
    this.motivoInspecaoSubject.next(motivo);
    if (motivo !== 'Outro') {
      this.motivoCustomizadoSubject.next('');
    }
    this.motivoInspecaoErrorSubject.next(null);
  }

  atualizarMotivoCustomizado(motivo: string): void {
    this.motivoCustomizadoSubject.next(motivo);
    this.motivoInspecaoErrorSubject.next(null);
  }

  // Confirma a inspeção para os itens selecionados
  confirmarInspecao(items: MuralListagemDTO[]): Observable<MuralListagemDTO[]> {
    const motivoInspecao = this.motivoInspecaoSubject.value;
    const motivoCustomizado = this.motivoCustomizadoSubject.value;
    const selectedIds = this.selectedItemsSubject.value;

    if (!motivoInspecao) {
      this.motivoInspecaoErrorSubject.next('Por favor, selecione um motivo para a inspeção.');
      throw new Error('Motivo de inspeção não selecionado');
    }

    if (motivoInspecao === 'Outro' && !motivoCustomizado) {
      this.motivoInspecaoErrorSubject.next('Por favor, informe o motivo da inspeção.');
      throw new Error('Motivo de inspeção customizado não informado');
    }

    // Se for motivo "Outro", envie o motivo customizado também
    return this.muralService.marcarVariosInspecionados(selectedIds, motivoInspecao, motivoCustomizado);
  }

  // Limpa a seleção
  clearSelection(): void {
    this.selectedItemsSubject.next([]);
  }

  // Obtém os IDs dos itens selecionados
  getSelectedIds(): string[] {
    return this.selectedItemsSubject.value;
  }

  // Controle do modal de ações em lote
  openAcoesModal(): void {
    if (!this.hasSelectedItems()) return;
    // Fecha o modal de inspeção se estiver aberto
    this.closeInspecaoModal();
    this.showAcoesModalSubject.next(true);
  }

  closeAcoesModal(): void {
    this.showAcoesModalSubject.next(false);
  }

  // Atualiza o total de itens na aba atual
  updateTotalItensAba(filtro: MuralFiltroDTO): void {
    // Usa o método contarTotalRegistros para obter o número exato de itens
    this.muralService.contarTotalRegistros(filtro).subscribe({
      next: (total) => {
        this.totalItensAbaSubject.next(total);
      },
      error: (erro) => {
        console.error('Erro ao contar total de registros:', erro);
        this.totalItensAbaSubject.next(0);
      }
    });
  }

  cancelarSelecaoBackend(): Observable<any> {
    const ids = this.getSelectedIds();
    return this.muralService.cancelarSelecao(ids);
  }

  desmarcarInspecionados(itens: MuralListagemDTO[]): void {
    const idsNaoInspecionados = itens.filter(item => !item.inspecionado).map(item => item.id);
    this.updateSelectedItems(idsNaoInspecionados);
  }
}

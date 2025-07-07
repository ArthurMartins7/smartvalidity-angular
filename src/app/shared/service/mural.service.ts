import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MuralFiltroDTO, MuralListagemDTO } from '../model/dto/mural.dto';


export interface FiltroOpcoes {
  marcas: string[];
  corredores: string[];
  categorias: string[];
  fornecedores: string[];
  lotes: string[];
}


export interface MuralFilter {
  corredor: string[];
  categoria: string[];
  fornecedor: string[];
  marca: string[];
  lote: string[];
  dataVencimento: {
    startDate: string | null;
    endDate: string | null;
  };
  dataFabricacao: {
    startDate: string | null;
    endDate: string | null;
  } | undefined;
  dataRecebimento: {
    startDate: string | null;
    endDate: string | null;
  } | undefined;
  inspecionado: boolean | undefined;
  motivoInspecao: string[];
  usuarioInspecao: string[];
}


export interface MuralFilterOptions {
  availableBrands: string[];
  availableCorredores: string[];
  availableCategorias: string[];
  availableFornecedores: string[];
  availableLotes: string[];
  availableUsuariosInspecao: string[];
}


@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private readonly API = `${environment.apiUrl}/mural`;

  constructor(private httpClient: HttpClient) { }


  getProximosVencer(): Observable<MuralListagemDTO[]> {
    return this.httpClient.get<MuralListagemDTO[]>(`${this.API}/proximos-vencer`);
  }


  getVencemHoje(): Observable<MuralListagemDTO[]> {
    return this.httpClient.get<MuralListagemDTO[]>(`${this.API}/vencem-hoje`);
  }


  getVencidos(): Observable<MuralListagemDTO[]> {
    return this.httpClient.get<MuralListagemDTO[]>(`${this.API}/vencidos`);
  }


  private getUsuarioAtual(): string {
    const nome = sessionStorage.getItem('usuarioNome');
    return nome || 'Sistema';
  }


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


  getItemById(id: string): Observable<MuralListagemDTO> {
    return this.httpClient.get<MuralListagemDTO>(`${this.API}/item/${id}`);
  }


  filtrarProdutos(filtro: MuralFiltroDTO): Observable<MuralListagemDTO[]> {
    return this.httpClient.post<MuralListagemDTO[]>(`${this.API}/filtrar`, filtro);
  }


  getOpcoesFiltro(): Observable<FiltroOpcoes> {
    return this.httpClient.get<FiltroOpcoes>(`${this.API}/filtro-opcoes`);
  }


  getUsuarios(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.API}/usuarios-inspecao`);
  }


  contarPaginas(filtro: MuralFiltroDTO): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/contar-paginas`, filtro);
  }


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


@Injectable({
  providedIn: 'root'
})
export class MuralFilterService {
  private readonly API = `${environment.apiUrl}/mural`;
  private readonly FILTER_STATE_KEY = 'muralFilterState';


  private initialFilter: MuralFilter = {
    corredor: [],
    categoria: [],
    fornecedor: [],
    marca: [],
    lote: [],
    dataVencimento: { startDate: null, endDate: null },
    dataFabricacao: undefined,
    dataRecebimento: undefined,
    inspecionado: undefined,
    motivoInspecao: [],
    usuarioInspecao: []
  };


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

  filters$ = this.filtersSubject.asObservable();
  searchTerm$ = this.searchTermSubject.asObservable();
  filterOptions$ = this.filterOptionsSubject.asObservable();
  sortField$ = this.sortFieldSubject.asObservable();
  sortDirection$ = this.sortDirectionSubject.asObservable();
  inspecaoFilter$ = this.inspecaoFilterSubject.asObservable();


  private paginaAtualSubject = new BehaviorSubject<number>(1);
  private itensPorPaginaSubject = new BehaviorSubject<number>(10);
  private totalPaginasSubject = new BehaviorSubject<number>(1);

  paginaAtual$ = this.paginaAtualSubject.asObservable();
  itensPorPagina$ = this.itensPorPaginaSubject.asObservable();
  totalPaginas$ = this.totalPaginasSubject.asObservable();

  constructor(private httpClient: HttpClient) { }

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


  addFilter(filterName: keyof MuralFilter, value: string): void {
    const currentFilters = this.filtersSubject.value;

    if (filterName === 'marca' || filterName === 'corredor' || filterName === 'categoria' ||
        filterName === 'fornecedor' || filterName === 'lote' ||
        filterName === 'motivoInspecao' || filterName === 'usuarioInspecao') {

      const currentArray = currentFilters[filterName] as string[];
      if (!currentArray.includes(value)) {
        const newFilters = {
          ...currentFilters,
          [filterName]: [...currentArray, value]
        };
        this.filtersSubject.next(newFilters);
        this.saveFilterState();
      }
    }
  }


  removeFilterValue(filterName: keyof MuralFilter, value: string): void {
    const currentFilters = this.filtersSubject.value;

    if (filterName === 'marca' || filterName === 'corredor' || filterName === 'categoria' ||
        filterName === 'fornecedor' || filterName === 'lote' ||
        filterName === 'motivoInspecao' || filterName === 'usuarioInspecao') {

      const currentArray = currentFilters[filterName] as string[];
      const newArray = currentArray.filter(item => item !== value);

      const newFilters = {
        ...currentFilters,
        [filterName]: newArray
      };
      this.filtersSubject.next(newFilters);
      this.saveFilterState();
    }
  }

  clearFilter(filterName: keyof MuralFilter): void {
    const currentFilters = this.filtersSubject.value;

    if (filterName === 'dataVencimento') {
      this.filtersSubject.next({
        ...currentFilters,
        dataVencimento: { startDate: null, endDate: null }
      });
    } else if (filterName === 'dataFabricacao' || filterName === 'dataRecebimento') {
      this.filtersSubject.next({
        ...currentFilters,
        [filterName]: undefined
      });
    } else if (filterName === 'inspecionado') {
      this.filtersSubject.next({
        ...currentFilters,
        inspecionado: undefined
      });
    } else if (filterName === 'motivoInspecao') {
      this.filtersSubject.next({
        ...currentFilters,
        motivoInspecao: []
      });
    } else if (filterName === 'usuarioInspecao') {
      this.filtersSubject.next({
        ...currentFilters,
        usuarioInspecao: []
      });
    } else {
      // Para campos de array (marca, corredor, categoria, fornecedor, lote)
      this.filtersSubject.next({
        ...currentFilters,
        [filterName]: []
      });
    }
    this.saveFilterState();
  }


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
    this.saveFilterState();
  }

  /**
   * Limpa um filtro de data específico.
   * Responsabilidade: Gerenciamento de estado de filtros de data (Service Layer).
   *
   * @param dateFieldName Nome do campo de data a ser limpo
   */
  clearSpecificDateFilter(dateFieldName: 'dataVencimento' | 'dataFabricacao' | 'dataRecebimento'): void {
    const currentFilters = this.filtersSubject.value;

    if (dateFieldName === 'dataVencimento') {
      currentFilters.dataVencimento = { startDate: null, endDate: null };
    } else {
      currentFilters[dateFieldName] = undefined;
    }

    this.filtersSubject.next(currentFilters);
    this.saveFilterState();
  }

  /**
   * Obtém lista de filtros de data aplicados com informações formatadas.
   * Responsabilidade: Transformação de dados para apresentação (Service Layer).
   *
   * @returns Array com informações dos filtros de data aplicados
   */
  getAppliedDateFilters(): Array<{
    type: 'dataVencimento' | 'dataFabricacao' | 'dataRecebimento';
    label: string;
    startDate: string | null;
    endDate: string | null;
    displayText: string;
  }> {
    const filters = this.filtersSubject.value;
    const dateFilters: Array<{
      type: 'dataVencimento' | 'dataFabricacao' | 'dataRecebimento';
      label: string;
      startDate: string | null;
      endDate: string | null;
      displayText: string;
    }> = [];

    /**
     * Formatação de data com garantia ABSOLUTA de preservação do valor original.
     * Esta função NUNCA altera os valores das datas escolhidas pelo usuário.
     *
     * @param dateStr Valor exato inserido pelo usuário no formato yyyy-mm-dd
     * @returns Data formatada em dd/mm/yyyy preservando valores exatos
     */
    const formatDateExact = (dateStr: string | null): string => {
      // Se não há valor, retorna vazio
      if (!dateStr || dateStr.trim() === '') {
        return '';
      }

      // Remove qualquer parte de tempo se existir (mas preserva a data)
      const cleanDateStr = dateStr.split('T')[0].trim();

      // Validação de formato yyyy-mm-dd (exatamente 10 caracteres)
      if (cleanDateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(cleanDateStr)) {
        // Divisão direta por posição para evitar qualquer ambiguidade
        const year = cleanDateStr.substring(0, 4);
        const month = cleanDateStr.substring(5, 7);
        const day = cleanDateStr.substring(8, 10);

        // Montagem direta sem validações de data que podem alterar valores
        return `${day}/${month}/${year}`;
      }

      // Se não está no formato esperado, retorna o valor original inalterado
      return dateStr;
    };

    // Processa cada tipo de filtro de data
    const dateFilterConfigs = [
      {
        condition: filters.dataVencimento && (filters.dataVencimento.startDate || filters.dataVencimento.endDate),
        type: 'dataVencimento' as const,
        label: 'Período de Vencimento',
        data: filters.dataVencimento
      },
      {
        condition: filters.dataFabricacao && (filters.dataFabricacao.startDate || filters.dataFabricacao.endDate),
        type: 'dataFabricacao' as const,
        label: 'Data de Fabricação',
        data: filters.dataFabricacao
      },
      {
        condition: filters.dataRecebimento && (filters.dataRecebimento.startDate || filters.dataRecebimento.endDate),
        type: 'dataRecebimento' as const,
        label: 'Data de Recebimento',
        data: filters.dataRecebimento
      }
    ];

    for (const config of dateFilterConfigs) {
      if (config.condition && config.data) {
        const startFormatted = formatDateExact(config.data.startDate);
        const endFormatted = formatDateExact(config.data.endDate);

        // Monta o texto de exibição
        let displayText = '';
        if (startFormatted && endFormatted) {
          displayText = `${startFormatted} até ${endFormatted}`;
        } else if (startFormatted && !endFormatted) {
          displayText = `${startFormatted} até Fim`;
        } else if (!startFormatted && endFormatted) {
          displayText = `Início até ${endFormatted}`;
        } else {
          displayText = 'Período não definido';
        }

        dateFilters.push({
          type: config.type,
          label: config.label,
          startDate: config.data.startDate,
          endDate: config.data.endDate,
          displayText
        });
      }
    }

    return dateFilters;
  }


  getCurrentFilters(): MuralFilter {
    return this.filtersSubject.value;
  }


  toFilterDTO(): MuralFiltroDTO {
    const filters = this.filtersSubject.value;
    const searchTerm = this.searchTermSubject.value;
    const sortField = this.sortFieldSubject.value;
    const sortDirection = this.sortDirectionSubject.value;
    const paginaAtual = this.paginaAtualSubject.value;
    const itensPorPagina = this.itensPorPaginaSubject.value;
    const inspecaoFilter = this.inspecaoFilterSubject.value;


    const convertDate = (dateStr: string | null | undefined): string | undefined => {
      if (!dateStr) return undefined;

      try {
              if (dateStr.includes('T')) {
        return dateStr;
      }

      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr + 'T00:00:00';
      }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn('Data inválida:', dateStr);
          return undefined;
        }

        return date.toISOString();
      } catch (error) {
        console.error('Erro ao converter data:', dateStr, error);
        return undefined;
      }
    };

    return {
      marcas: filters.marca && filters.marca.length > 0 ? filters.marca : undefined,
      corredores: filters.corredor && filters.corredor.length > 0 ? filters.corredor : undefined,
      categorias: filters.categoria && filters.categoria.length > 0 ? filters.categoria : undefined,
      fornecedores: filters.fornecedor && filters.fornecedor.length > 0 ? filters.fornecedor : undefined,
      lotes: filters.lote && filters.lote.length > 0 ? filters.lote : undefined,
      motivosInspecao: filters.motivoInspecao && filters.motivoInspecao.length > 0 ? filters.motivoInspecao : undefined,
      usuariosInspecao: filters.usuarioInspecao && filters.usuarioInspecao.length > 0 ? filters.usuarioInspecao : undefined,

      marca: filters.marca && filters.marca.length > 0 ? filters.marca[0] : '',
      corredor: filters.corredor && filters.corredor.length > 0 ? filters.corredor[0] : '',
      categoria: filters.categoria && filters.categoria.length > 0 ? filters.categoria[0] : '',
      fornecedor: filters.fornecedor && filters.fornecedor.length > 0 ? filters.fornecedor[0] : '',
      lote: filters.lote && filters.lote.length > 0 ? filters.lote[0] : '',
      motivoInspecao: filters.motivoInspecao && filters.motivoInspecao.length > 0 ? filters.motivoInspecao[0] : '',
      usuarioInspecao: filters.usuarioInspecao && filters.usuarioInspecao.length > 0 ? filters.usuarioInspecao[0] : '',

      dataVencimentoInicio: convertDate(filters.dataVencimento?.startDate),
      dataVencimentoFim: convertDate(filters.dataVencimento?.endDate),
      dataFabricacaoInicio: convertDate(filters.dataFabricacao?.startDate),
      dataFabricacaoFim: convertDate(filters.dataFabricacao?.endDate),
      dataRecebimentoInicio: convertDate(filters.dataRecebimento?.startDate),
      dataRecebimentoFim: convertDate(filters.dataRecebimento?.endDate),

      inspecionado: inspecaoFilter === 'todos' ? undefined :
                   inspecaoFilter === 'inspecionados' ? true : false,
      searchTerm: searchTerm,
      sortBy: sortField,
      sortDirection: sortDirection,
      pagina: paginaAtual,
      limite: itensPorPagina
    };
  }


  hasAppliedFilters(): boolean {
    const filters = this.filtersSubject.value;
    const searchTerm = this.searchTermSubject.value;

    return (
      (filters.marca && filters.marca.length > 0) ||
      (filters.corredor && filters.corredor.length > 0) ||
      (filters.categoria && filters.categoria.length > 0) ||
      (filters.fornecedor && filters.fornecedor.length > 0) ||
      (filters.lote && filters.lote.length > 0) ||
      filters.inspecionado !== undefined ||
      !!filters.dataVencimento?.startDate ||
      !!filters.dataVencimento?.endDate ||
      !!filters.dataFabricacao?.startDate ||
      !!filters.dataFabricacao?.endDate ||
      !!filters.dataRecebimento?.startDate ||
      !!filters.dataRecebimento?.endDate ||
      (filters.motivoInspecao && filters.motivoInspecao.length > 0) ||
      (filters.usuarioInspecao && filters.usuarioInspecao.length > 0) ||
      !!searchTerm
    );
  }

  /**
   * Verifica se há filtros avançados aplicados (excluindo busca por texto simples).
   * Usado para determinar se o botão "limpar todos" deve aparecer.
   * Responsabilidade: Service Layer - lógica de negócio para UI.
   */
  hasAdvancedFilters(): boolean {
    const filters = this.filtersSubject.value;

    return (
      (filters.marca && filters.marca.length > 0) ||
      (filters.corredor && filters.corredor.length > 0) ||
      (filters.categoria && filters.categoria.length > 0) ||
      (filters.fornecedor && filters.fornecedor.length > 0) ||
      (filters.lote && filters.lote.length > 0) ||
      filters.inspecionado !== undefined ||
      !!filters.dataVencimento?.startDate ||
      !!filters.dataVencimento?.endDate ||
      !!filters.dataFabricacao?.startDate ||
      !!filters.dataFabricacao?.endDate ||
      !!filters.dataRecebimento?.startDate ||
      !!filters.dataRecebimento?.endDate ||
      (filters.motivoInspecao && filters.motivoInspecao.length > 0) ||
      (filters.usuarioInspecao && filters.usuarioInspecao.length > 0)
    );
  }

  updatePaginaAtual(pagina: number): void {
    this.paginaAtualSubject.next(pagina);
  }

  updateItensPorPagina(itens: number): void {
    this.itensPorPaginaSubject.next(itens);

    this.paginaAtualSubject.next(1);
  }

  updateTotalPaginas(total: number): void {
    this.totalPaginasSubject.next(total);
  }


  loadFilterOptions(): void {

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

  /**
   * Combina arrays de filtros existentes com novos, evitando duplicação.
   * Responsabilidade: Lógica de negócio para combinação de filtros (Service Layer).
   *
   * @param currentArray Array de filtros atualmente aplicados
   * @param newArray Array de novos filtros temporários
   * @returns Array combinado sem duplicatas
   */
  combineArrayFilters(currentArray: string[], newArray: string[]): string[] {
    if (!newArray || newArray.length === 0) {
      return currentArray || [];
    }

    const combined = [...(currentArray || [])];

    newArray.forEach(value => {
      if (value && !combined.includes(value)) {
        combined.push(value);
      }
    });

    return combined;
  }

  /**
   * Verifica se um filtro de data tem valores definidos.
   * Responsabilidade: Validação de dados de filtros (Service Layer).
   *
   * @param dateFilter Filtro de data a ser verificado
   * @returns true se tem valores definidos
   */
  hasDateValues(dateFilter: { startDate: string | null; endDate: string | null } | undefined): boolean {
    return dateFilter != null &&
           (dateFilter.startDate != null && dateFilter.startDate !== '' ||
            dateFilter.endDate != null && dateFilter.endDate !== '');
  }

  /**
   * Combina filtros existentes com novos de forma cumulativa.
   * Responsabilidade: Lógica central de acúmulo de filtros (Service Layer).
   *
   * @param currentFilters Filtros atualmente aplicados
   * @param tempFilters Novos filtros temporários
   * @returns Filtros combinados
   */
  combineFilters(currentFilters: MuralFilter, tempFilters: MuralFilter): MuralFilter {
    return {
      // Arrays de filtros - combina valores existentes com novos (sem duplicação)
      marca: this.combineArrayFilters(currentFilters.marca, tempFilters.marca),
      corredor: this.combineArrayFilters(currentFilters.corredor, tempFilters.corredor),
      categoria: this.combineArrayFilters(currentFilters.categoria, tempFilters.categoria),
      fornecedor: this.combineArrayFilters(currentFilters.fornecedor, tempFilters.fornecedor),
      lote: this.combineArrayFilters(currentFilters.lote, tempFilters.lote),
      usuarioInspecao: this.combineArrayFilters(currentFilters.usuarioInspecao, tempFilters.usuarioInspecao),
      motivoInspecao: this.combineArrayFilters(currentFilters.motivoInspecao, tempFilters.motivoInspecao),

      // Filtros de data - aplicam novos valores se especificados, senão mantém atuais
      dataVencimento: this.hasDateValues(tempFilters.dataVencimento)
        ? tempFilters.dataVencimento
        : currentFilters.dataVencimento,
      dataFabricacao: this.hasDateValues(tempFilters.dataFabricacao)
        ? tempFilters.dataFabricacao
        : currentFilters.dataFabricacao,
      dataRecebimento: this.hasDateValues(tempFilters.dataRecebimento)
        ? tempFilters.dataRecebimento
        : currentFilters.dataRecebimento,

      // Filtro booleano - aplica novo valor se especificado, senão mantém atual
      inspecionado: tempFilters.inspecionado !== undefined
        ? tempFilters.inspecionado
        : currentFilters.inspecionado
    };
  }
}


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


  readonly motivosInspecao: string[] = ['Avaria/Quebra', 'Promoção', 'Outro'];


  selectedItems$: Observable<string[]> = this.selectedItemsSubject.asObservable();
  showInspecaoModal$: Observable<boolean> = this.showInspecaoModalSubject.asObservable();
  showAcoesModal$: Observable<boolean> = this.showAcoesModalSubject.asObservable();
  motivoInspecao$: Observable<string> = this.motivoInspecaoSubject.asObservable();
  motivoInspecaoError$: Observable<string | null> = this.motivoInspecaoErrorSubject.asObservable();
  motivoCustomizado$: Observable<string> = this.motivoCustomizadoSubject.asObservable();
  totalItensAba$: Observable<number> = this.totalItensAbaSubject.asObservable();

  constructor(private muralService: MuralService) { }

  updateSelectedItems(items: string[]): void {
    this.selectedItemsSubject.next(items);
  }


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


  selectAllInTab(totalItens: number): void {
    this.totalItensAbaSubject.next(totalItens);
  }


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


  hasSelectedItems(): boolean {
    return this.selectedItemsSubject.value.length > 0;
  }


  getSelectedItemsCount(): number {
    return this.selectedItemsSubject.value.length;
  }


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

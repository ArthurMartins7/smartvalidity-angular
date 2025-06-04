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

  // Método para adicionar um filtro cumulativo
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

  // Método para remover um valor específico de um filtro array
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

  // Obter o valor atual dos filtros
  getCurrentFilters(): MuralFilter {
    return this.filtersSubject.value;
  }

  /**
   * Converte o estado atual dos filtros para o formato DTO esperado pelo backend.
   * Responsabilidade: Transformação de dados do modelo de view para o modelo de dados.
   * Arquitetura MVC: Service layer - conversão entre modelos.
   *
   * @returns DTO formatado para envio ao backend
   */
  toFilterDTO(): MuralFiltroDTO {
    const filters = this.filtersSubject.value;
    const searchTerm = this.searchTermSubject.value;
    const sortField = this.sortFieldSubject.value;
    const sortDirection = this.sortDirectionSubject.value;
    const paginaAtual = this.paginaAtualSubject.value;
    const itensPorPagina = this.itensPorPaginaSubject.value;
    const inspecaoFilter = this.inspecaoFilterSubject.value;

    /**
     * Função auxiliar para converter data string para formato LocalDateTime do backend.
     * Responsabilidade: Formatação de dados para comunicação com API.
     */
    const convertDate = (dateStr: string | null | undefined): string | undefined => {
      if (!dateStr) return undefined;

      try {
        // Se já está no formato ISO, só adiciona o tempo se necessário
        if (dateStr.includes('T')) {
          return dateStr;
        }

        // Se está no formato yyyy-mm-dd, adiciona o horário apropriado
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateStr + 'T00:00:00';
        }

        // Tenta fazer o parse da data para garantir que é válida
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
      // Novos campos para múltiplos valores (arrays)
      marcas: filters.marca && filters.marca.length > 0 ? filters.marca : undefined,
      corredores: filters.corredor && filters.corredor.length > 0 ? filters.corredor : undefined,
      categorias: filters.categoria && filters.categoria.length > 0 ? filters.categoria : undefined,
      fornecedores: filters.fornecedor && filters.fornecedor.length > 0 ? filters.fornecedor : undefined,
      lotes: filters.lote && filters.lote.length > 0 ? filters.lote : undefined,
      motivosInspecao: filters.motivoInspecao && filters.motivoInspecao.length > 0 ? filters.motivoInspecao : undefined,
      usuariosInspecao: filters.usuarioInspecao && filters.usuarioInspecao.length > 0 ? filters.usuarioInspecao : undefined,

      // Campos legados para compatibilidade - pega o primeiro valor ou string vazia
      marca: filters.marca && filters.marca.length > 0 ? filters.marca[0] : '',
      corredor: filters.corredor && filters.corredor.length > 0 ? filters.corredor[0] : '',
      categoria: filters.categoria && filters.categoria.length > 0 ? filters.categoria[0] : '',
      fornecedor: filters.fornecedor && filters.fornecedor.length > 0 ? filters.fornecedor[0] : '',
      lote: filters.lote && filters.lote.length > 0 ? filters.lote[0] : '',
      motivoInspecao: filters.motivoInspecao && filters.motivoInspecao.length > 0 ? filters.motivoInspecao[0] : '',
      usuarioInspecao: filters.usuarioInspecao && filters.usuarioInspecao.length > 0 ? filters.usuarioInspecao[0] : '',

      // Campos de data com validação melhorada
      dataVencimentoInicio: convertDate(filters.dataVencimento?.startDate),
      dataVencimentoFim: convertDate(filters.dataVencimento?.endDate),
      dataFabricacaoInicio: convertDate(filters.dataFabricacao?.startDate),
      dataFabricacaoFim: convertDate(filters.dataFabricacao?.endDate),
      dataRecebimentoInicio: convertDate(filters.dataRecebimento?.startDate),
      dataRecebimentoFim: convertDate(filters.dataRecebimento?.endDate),

      // Aplicar filtro de inspeção corretamente
      inspecionado: inspecaoFilter === 'todos' ? undefined :
                   inspecaoFilter === 'inspecionados' ? true : false,
      searchTerm: searchTerm,
      sortBy: sortField,
      sortDirection: sortDirection,
      pagina: paginaAtual,
      limite: itensPorPagina
    };
  }

  // Verifica se há filtros aplicados
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

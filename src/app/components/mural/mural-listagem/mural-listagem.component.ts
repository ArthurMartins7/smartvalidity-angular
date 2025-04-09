import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MuralItem } from '../../../models/mural.model';
import { MuralService } from '../../../services/mural.service';

/**
 * Componente para listagem e gestão dos itens no mural de validade
 */
@Component({
  selector: 'app-mural-listagem',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './mural-listagem.component.html',
  styleUrl: './mural-listagem.component.css'
})
export class MuralListagemComponent implements OnInit, OnDestroy {
  // -------------------- Propriedades Principais --------------------
  /** Lista de todos os itens carregados */
  items: MuralItem[] = [];

  /** Lista de itens filtrados atualmente visíveis */
  filteredItems: MuralItem[] = [];

  /** Aba ativa atual */
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';

  /** Termo de pesquisa para filtrar itens */
  searchTerm: string = '';

  /** Direção de ordenação atual */
  sortDirection: 'asc' | 'desc' = 'asc';

  // -------------------- Filtros --------------------
  /** Filtro de data */
  dateFilter = {
    startDate: '',
    endDate: ''
  };

  /** Filtro de marca */
  brandFilter: string = '';

  /** Marcas disponíveis para filtro */
  availableBrands: string[] = [];

  /** Corredores disponíveis para filtro */
  availableCorredores: string[] = [];

  /** Categorias disponíveis para filtro */
  availableCategorias: string[] = [];

  /** Fornecedores disponíveis para filtro */
  availableFornecedores: string[] = [];

  /** Lotes disponíveis para filtro */
  availableLotes: string[] = [];

  // -------------------- Controle de UI --------------------
  /** Visibilidade do modal de filtros avançados */
  showFilterModal: boolean = false;

  /** Visibilidade do dropdown de marca */
  showMarcaDropdown: boolean = false;

  /** Visibilidade do dropdown de fornecedor */
  showFornecedorDropdown: boolean = false;

  /** Visibilidade do dropdown de lote */
  showLoteDropdown: boolean = false;

  /** Visibilidade do dropdown de corredor */
  showCorredorDropdown: boolean = false;

  /** Visibilidade do dropdown de categoria */
  showCategoriaDropdown: boolean = false;

  // -------------------- Listas Filtradas --------------------
  /** Lista filtrada de marcas para dropdown */
  filteredBrands: string[] = [];

  /** Lista filtrada de fornecedores para dropdown */
  filteredFornecedores: string[] = [];

  /** Lista filtrada de lotes para dropdown */
  filteredLotes: string[] = [];

  /** Lista filtrada de corredores para dropdown */
  filteredCorredores: string[] = [];

  /** Lista filtrada de categorias para dropdown */
  filteredCategorias: string[] = [];

  // -------------------- Filtros Avançados --------------------
  /** Configuração de filtros avançados */
  advancedFilters = {
    corredor: '',
    categoria: '',
    fornecedor: '',
    marca: '',
    lote: '',
    dataVencimento: {
      startDate: '',
      endDate: ''
    },
    dataFabricacao: {
      startDate: '',
      endDate: ''
    },
    dataRecebimento: {
      startDate: '',
      endDate: ''
    }
  };

  /** Subscriptions para gerenciar unsubscribe */
  private subscriptions: Subscription[] = [];

  // -------------------- Propriedades para Modal de Filtro --------------------
  showInspecaoModal = false;

  // -------------------- Propriedades para Dropdown de Motivo de Inspeção --------------------
  motivoInspecao: string = '';
  motivosInspecao: string[] = ['Avaria/Quebra', 'Promoção'];
  itensSelecionados: string[] = [];
  motivoInspecaoError: string | null = null;

  /**
   * Construtor do componente
   */
  constructor(
    private muralService: MuralService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Adicionar um listener para fechar os dropdowns quando o usuário clica fora deles
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  /**
   * Handler para fechar dropdowns quando o usuário clica fora deles
   */
  private handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.closeAllDropdowns();
    }
  }

  /**
   * Fecha todos os dropdowns abertos
   */
  private closeAllDropdowns(): void {
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
    this.showCorredorDropdown = false;
    this.showCategoriaDropdown = false;
  }

  /**
   * Inicialização do componente
   */
  ngOnInit(): void {
    this.initializeFromRouting();
    this.loadFilterOptions();
  }

  /**
   * Limpeza ao destruir o componente
   */
  ngOnDestroy(): void {
    // Remover event listener para evitar memory leaks
    document.removeEventListener('click', this.handleOutsideClick.bind(this));

    // Cancelar todas as subscriptions ativas
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Inicializa o componente com base nos parâmetros de rota
   */
  private initializeFromRouting(): void {
    // Primeiro verificamos se há um state com a aba ativa
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && 'activeTab' in navigation.extras.state) {
      this.activeTab = navigation.extras.state['activeTab'] as 'proximo' | 'hoje' | 'vencido';
      this.loadItems();
    } else {
      // Se não houver estado, verificamos os parâmetros da URL
      const subscription = this.route.queryParams.subscribe(params => {
        if (params['tab']) {
          this.activeTab = params['tab'] as 'proximo' | 'hoje' | 'vencido';
        }
        this.loadItems();
      });
      this.subscriptions.push(subscription);
    }
  }

  /**
   * Carrega os itens com base na aba ativa
   */
  loadItems(): void {
    let serviceCall;
    switch (this.activeTab) {
      case 'proximo':
        serviceCall = this.muralService.getProximosVencer();
        break;
      case 'hoje':
        serviceCall = this.muralService.getVencemHoje();
        break;
      case 'vencido':
        serviceCall = this.muralService.getVencidos();
        break;
    }

    const subscription = serviceCall.subscribe({
      next: (items) => {
        // Garantir que todos os itens sejam exibidos, incluindo os inspecionados
        // e que o valor de inspecionado esteja definido corretamente
        this.items = items.map(item => {
          if (item.inspecionado === undefined || item.inspecionado === null) {
            item.inspecionado = false;
          }
          return item;
        });
        this.extractAvailableFilterOptions();
        this.applyFilter();
      },
      error: (error) => console.error(`Erro ao carregar itens de ${this.activeTab}:`, error)
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Extrai as opções disponíveis para os filtros a partir dos itens carregados
   */
  extractAvailableFilterOptions(): void {
    const brands = new Set<string>();
    const corredores = new Set<string>();
    const categorias = new Set<string>();
    const fornecedores = new Set<string>();
    const lotes = new Set<string>();

    this.items.forEach(item => {
      if (item.produto?.marca) brands.add(item.produto.marca);
      if (item.corredor) corredores.add(item.corredor);
      if (item.categoria) categorias.add(item.categoria);
      if (item.fornecedor) fornecedores.add(item.fornecedor);
      if (item.lote) lotes.add(item.lote);
    });

    this.availableBrands = Array.from(brands).sort();
    this.availableCorredores = Array.from(corredores).sort();
    this.availableCategorias = Array.from(categorias).sort();
    this.availableFornecedores = Array.from(fornecedores).sort();
    this.availableLotes = Array.from(lotes).sort();

    // Atualizar as listas filtradas
    this.updateFilteredLists();
  }

  /**
   * Atualiza as listas filtradas para os dropdowns
   */
  private updateFilteredLists(): void {
    this.filteredBrands = [...this.availableBrands];
    this.filteredFornecedores = [...this.availableFornecedores];
    this.filteredLotes = [...this.availableLotes];
    this.filteredCorredores = [...this.availableCorredores];
    this.filteredCategorias = [...this.availableCategorias];
  }

  /**
   * Define a aba ativa e carrega os itens correspondentes
   */
  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido'): void {
    this.activeTab = tab;
    // Atualiza a URL sem recarregar a página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.loadItems();
  }

  /**
   * Aplica os filtros aos itens e atualiza a lista filtrada
   */
  applyFilter(): void {
    let filtered = [...this.items];

    // Filtro de pesquisa textual
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.produto?.descricao?.toLowerCase().includes(searchTermLower) ||
        item.produto?.codigoBarras?.toLowerCase().includes(searchTermLower) ||
        item.produto?.marca?.toLowerCase().includes(searchTermLower)
      );
    }

    // Aplicar filtros avançados
    filtered = this.applyAdvancedFiltersToItems(filtered);

    this.filteredItems = filtered;
    this.sortItems();
  }

  /**
   * Aplica os filtros avançados a uma lista de itens
   */
  private applyAdvancedFiltersToItems(items: MuralItem[]): MuralItem[] {
    let filtered = [...items];
    const filters = this.advancedFilters;

    // Filtros de texto
    if (filters.marca) {
      filtered = filtered.filter(item => item.produto?.marca === filters.marca);
    }
    if (filters.corredor) {
      filtered = filtered.filter(item => item.corredor === filters.corredor);
    }
    if (filters.categoria) {
      filtered = filtered.filter(item => item.categoria === filters.categoria);
    }
    if (filters.fornecedor) {
      filtered = filtered.filter(item => item.fornecedor === filters.fornecedor);
    }
    if (filters.lote) {
      filtered = filtered.filter(item =>
        item.lote && item.lote.toLowerCase().includes(filters.lote.toLowerCase())
      );
    }

    // Filtros de data
    filtered = this.applyDateFilters(filtered);

    return filtered;
  }

  /**
   * Aplica os filtros de data aos itens
   */
  private applyDateFilters(items: MuralItem[]): MuralItem[] {
    let filtered = [...items];
    const filters = this.advancedFilters;

    // Data de vencimento
    if (filters.dataVencimento.startDate) {
      const startDate = new Date(filters.dataVencimento.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataValidade);
        return itemDate >= startDate;
      });
    }

    if (filters.dataVencimento.endDate) {
      const endDate = new Date(filters.dataVencimento.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataValidade);
        return itemDate <= endDate;
      });
    }

    // Data de fabricação
    if (filters.dataFabricacao.startDate) {
      const startDate = new Date(filters.dataFabricacao.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        if (!item.dataFabricacao) return false;
        const itemDate = new Date(item.dataFabricacao);
        return itemDate >= startDate;
      });
    }

    if (filters.dataFabricacao.endDate) {
      const endDate = new Date(filters.dataFabricacao.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.dataFabricacao) return false;
        const itemDate = new Date(item.dataFabricacao);
        return itemDate <= endDate;
      });
    }

    // Data de recebimento
    if (filters.dataRecebimento.startDate) {
      const startDate = new Date(filters.dataRecebimento.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        if (!item.dataRecebimento) return false;
        const itemDate = new Date(item.dataRecebimento);
        return itemDate >= startDate;
      });
    }

    if (filters.dataRecebimento.endDate) {
      const endDate = new Date(filters.dataRecebimento.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.dataRecebimento) return false;
        const itemDate = new Date(item.dataRecebimento);
        return itemDate <= endDate;
      });
    }

    return filtered;
  }

  // -------------------- Métodos do Modal de Filtros --------------------

  /**
   * Abre o modal de filtros avançados
   */
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  /**
   * Fecha o modal de filtros avançados
   */
  closeFilterModal(): void {
    this.showFilterModal = false;
    this.closeAllDropdowns();
  }

  /**
   * Reseta todos os filtros avançados para seus valores padrão
   */
  resetFilters(): void {
    this.advancedFilters = {
      corredor: '',
      categoria: '',
      fornecedor: '',
      marca: '',
      lote: '',
      dataVencimento: { startDate: '', endDate: '' },
      dataFabricacao: { startDate: '', endDate: '' },
      dataRecebimento: { startDate: '', endDate: '' }
    };
  }

  /**
   * Aplica os filtros avançados e fecha o modal
   */
  applyAdvancedFilters(): void {
    this.applyFilter();
    this.closeFilterModal();
  }

  /**
   * Verifica se há filtros aplicados
   */
  hasAppliedFilters(): boolean {
    const f = this.advancedFilters;
    return !!(f.marca || f.corredor || f.categoria || f.fornecedor || f.lote ||
           f.dataVencimento.startDate || f.dataVencimento.endDate ||
           f.dataFabricacao.startDate || f.dataFabricacao.endDate ||
           f.dataRecebimento.startDate || f.dataRecebimento.endDate);
  }

  /**
   * Limpa um filtro específico
   */
  clearFilter(filterName: string): void {
    if (filterName in this.advancedFilters) {
      (this.advancedFilters as any)[filterName] = '';
      this.applyFilter();
    }
  }

  /**
   * Limpa os filtros de data
   */
  clearDateFilter(): void {
    this.advancedFilters.dataVencimento.startDate = '';
    this.advancedFilters.dataVencimento.endDate = '';
    this.applyFilter();
  }

  /**
   * Reseta todos os filtros e aplica as mudanças
   */
  resetAllFilters(): void {
    this.resetFilters();
    this.applyFilter();
  }

  // -------------------- Métodos de Ordenação --------------------

  /**
   * Alterna entre ordenação ascendente e descendente
   */
  toggleSortOrder(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortItems();
  }

  /**
   * Ordena os itens filtrados conforme a direção atual
   */
  sortItems(): void {
    this.filteredItems.sort((a, b) => {
      const descA = a.produto?.descricao?.toLowerCase() || '';
      const descB = b.produto?.descricao?.toLowerCase() || '';

      return this.sortDirection === 'asc'
        ? descA.localeCompare(descB)
        : descB.localeCompare(descA);
    });
  }

  // -------------------- Métodos de Seleção --------------------

  /**
   * Seleciona ou desmarca todos os itens
   */
  selectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    this.filteredItems.forEach(item => {
      item.selecionado = checked;
    });
  }

  /**
   * Verifica se há itens selecionados
   */
  hasSelectedItems(): boolean {
    return this.filteredItems.some(item => item.selecionado);
  }

  /**
   * Retorna o número de itens selecionados
   */
  getSelectedItemsCount(): number {
    return this.filteredItems.filter(item => item.selecionado).length;
  }

  /**
   * Marca todos os itens selecionados como inspecionados
   */
  marcarSelecionadosComoInspecionados(): void {
    this.openInspecaoModal();
  }

  // -------------------- Métodos de Filtros Dropdown --------------------

  /**
   * Inicializa as opções de filtro
   */
  loadFilterOptions(): void {
    this.updateFilteredLists();
  }

  // ----------------- Métodos para manipulação de dropdowns -----------------

  /**
   * Métodos para marca
   */
  toggleMarcaDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeAllDropdowns();
    this.showMarcaDropdown = !this.showMarcaDropdown;
    if (this.showMarcaDropdown) {
      this.filterBrandOptions(this.advancedFilters.marca);
    }
  }

  filterBrandOptions(searchText: string): void {
    this.filterDropdownOptions(searchText, this.availableBrands, this.filteredBrands);
  }

  selectBrand(brand: string): void {
    this.advancedFilters.marca = brand;
    this.showMarcaDropdown = false;
  }

  /**
   * Métodos para fornecedor
   */
  toggleFornecedorDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeAllDropdowns();
    this.showFornecedorDropdown = !this.showFornecedorDropdown;
    if (this.showFornecedorDropdown) {
      this.filterFornecedorOptions(this.advancedFilters.fornecedor);
    }
  }

  filterFornecedorOptions(searchText: string): void {
    this.filterDropdownOptions(searchText, this.availableFornecedores, this.filteredFornecedores);
  }

  selectFornecedor(fornecedor: string): void {
    this.advancedFilters.fornecedor = fornecedor;
    this.showFornecedorDropdown = false;
  }

  /**
   * Métodos para lote
   */
  toggleLoteDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeAllDropdowns();
    this.showLoteDropdown = !this.showLoteDropdown;
    if (this.showLoteDropdown) {
      this.filterLoteOptions(this.advancedFilters.lote);
    }
  }

  filterLoteOptions(searchText: string): void {
    this.filterDropdownOptions(searchText, this.availableLotes, this.filteredLotes);
  }

  selectLote(lote: string): void {
    this.advancedFilters.lote = lote;
    this.showLoteDropdown = false;
  }

  /**
   * Métodos para corredor
   */
  toggleCorredorDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeAllDropdowns();
    this.showCorredorDropdown = !this.showCorredorDropdown;
    if (this.showCorredorDropdown) {
      this.filterCorredorOptions(this.advancedFilters.corredor);
    }
  }

  filterCorredorOptions(searchText: string): void {
    this.filterDropdownOptions(searchText, this.availableCorredores, this.filteredCorredores);
  }

  selectCorredor(corredor: string): void {
    this.advancedFilters.corredor = corredor;
    this.showCorredorDropdown = false;
  }

  /**
   * Métodos para categoria
   */
  toggleCategoriaDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.closeAllDropdowns();
    this.showCategoriaDropdown = !this.showCategoriaDropdown;
    if (this.showCategoriaDropdown) {
      this.filterCategoriaOptions(this.advancedFilters.categoria);
    }
  }

  filterCategoriaOptions(searchText: string): void {
    this.filterDropdownOptions(searchText, this.availableCategorias, this.filteredCategorias);
  }

  selectCategoria(categoria: string): void {
    this.advancedFilters.categoria = categoria;
    this.showCategoriaDropdown = false;
  }

  /**
   * Método genérico para filtrar opções de dropdown
   */
  private filterDropdownOptions(searchText: string, availableOptions: string[], resultArray: string[]): void {
    resultArray.length = 0; // Limpar array atual

    if (!searchText || searchText.trim() === '') {
      // Se não houver texto de busca, mostrar todas as opções
      resultArray.push(...availableOptions);
    } else {
      // Filtrar as opções que contêm o texto de busca
      const normalizedSearch = searchText.toLowerCase().trim();
      const filtered = availableOptions.filter(option =>
        option.toLowerCase().includes(normalizedSearch)
      );

      // Se não encontrar resultados, mostrar todas as opções
      if (filtered.length === 0) {
        resultArray.push(...availableOptions);
      } else {
        resultArray.push(...filtered);
      }
    }
  }

  // ----------------- Métodos de busca explícita -----------------

  /**
   * Buscas explícitas usando a lupa
   */
  searchBrands(event: MouseEvent): void {
    event.stopPropagation();
    this.filterBrandOptions(this.advancedFilters.marca);
    this.closeAllDropdowns();
    this.showMarcaDropdown = true;
  }

  searchFornecedores(event: MouseEvent): void {
    event.stopPropagation();
    this.filterFornecedorOptions(this.advancedFilters.fornecedor);
    this.closeAllDropdowns();
    this.showFornecedorDropdown = true;
  }

  searchLotes(event: MouseEvent): void {
    event.stopPropagation();
    this.filterLoteOptions(this.advancedFilters.lote);
    this.closeAllDropdowns();
    this.showLoteDropdown = true;
  }

  searchCorredores(event: MouseEvent): void {
    event.stopPropagation();
    this.filterCorredorOptions(this.advancedFilters.corredor);
    this.closeAllDropdowns();
    this.showCorredorDropdown = true;
  }

  searchCategorias(event: MouseEvent): void {
    event.stopPropagation();
    this.filterCategoriaOptions(this.advancedFilters.categoria);
    this.closeAllDropdowns();
    this.showCategoriaDropdown = true;
  }

  /**
   * Abre o modal de inspeção
   */
  openInspecaoModal(): void {
    if (!this.hasSelectedItems()) return;

    this.itensSelecionados = this.filteredItems
      .filter(item => item.selecionado)
      .map(item => item.id);

    this.motivoInspecao = '';
    this.motivoInspecaoError = null;
    this.showInspecaoModal = true;
  }

  /**
   * Fecha o modal de inspeção
   */
  closeInspecaoModal(): void {
    this.showInspecaoModal = false;
    this.motivoInspecao = '';
    this.motivoInspecaoError = null;
  }

  /**
   * Seleciona um motivo de inspeção
   */
  selecionarMotivo(motivo: string): void {
    this.motivoInspecao = motivo;
    this.motivoInspecaoError = null;
  }

  /**
   * Confirma a inspeção com o motivo selecionado
   */
  confirmarInspecao(): void {
    if (!this.motivoInspecao) {
      this.motivoInspecaoError = 'Por favor, selecione um motivo para a inspeção.';
      return;
    }

    const subscription = this.muralService.marcarVariosInspecionados(this.itensSelecionados, this.motivoInspecao).subscribe({
      next: () => {
        this.items.forEach(item => {
          if (this.itensSelecionados.includes(item.id)) {
            item.inspecionado = true;
            item.motivoInspecao = this.motivoInspecao;
          }
        });
        this.closeInspecaoModal();
        this.applyFilter();
      },
      error: (error) => {
        console.error('Erro ao marcar itens como inspecionados:', error);
        this.motivoInspecaoError = 'Ocorreu um erro ao processar a inspeção. Por favor, tente novamente.';
      }
    });

    this.subscriptions.push(subscription);
  }
}

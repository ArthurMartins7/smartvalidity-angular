import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MuralItem } from '../../../models/mural.model';
import { MuralService } from '../../../services/mural.service';

@Component({
  selector: 'app-mural-listagem',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './mural-listagem.component.html',
  styleUrl: './mural-listagem.component.css'
})
export class MuralListagemComponent implements OnInit {
  // Dados principais
  items: MuralItem[] = [];
  filteredItems: MuralItem[] = [];
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';

  // Pesquisa e ordenação
  searchTerm: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filtros básicos
  dateFilter = {
    startDate: '',
    endDate: ''
  };
  brandFilter: string = '';
  availableBrands: string[] = [];

  // Modal e filtros avançados
  showFilterModal: boolean = false;
  availableCorredores: string[] = [];
  availableCategorias: string[] = [];
  availableFornecedores: string[] = [];
  availableLotes: string[] = [];

  // Controle para dropdowns personalizados
  showMarcaDropdown: boolean = false;
  showFornecedorDropdown: boolean = false;
  showLoteDropdown: boolean = false;
  showCorredorDropdown: boolean = false;
  showCategoriaDropdown: boolean = false;

  // Listas filtradas para os dropdowns
  filteredBrands: string[] = [];
  filteredFornecedores: string[] = [];
  filteredLotes: string[] = [];
  filteredCorredores: string[] = [];
  filteredCategorias: string[] = [];

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

  constructor(
    private muralService: MuralService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Adicionar um listener para fechar os dropdowns quando o usuário clica fora deles
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        this.showMarcaDropdown = false;
        this.showFornecedorDropdown = false;
        this.showLoteDropdown = false;
        this.showCorredorDropdown = false;
        this.showCategoriaDropdown = false;
      }
    });
  }

  ngOnInit() {
    // Primeiro verificamos se há um state com a aba ativa
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && 'activeTab' in navigation.extras.state) {
      this.activeTab = navigation.extras.state['activeTab'] as 'proximo' | 'hoje' | 'vencido';
      this.loadItems();
    } else {
      // Se não houver estado, verificamos os parâmetros da URL
      this.route.queryParams.subscribe(params => {
        if (params['tab']) {
          this.activeTab = params['tab'] as 'proximo' | 'hoje' | 'vencido';
        }
        this.loadItems();
      });
    }
    this.loadFilterOptions();
  }

  loadItems() {
    switch (this.activeTab) {
      case 'proximo':
        this.muralService.getProximosVencer().subscribe({
          next: (items) => {
            this.items = items.filter(item => !item.inspecionado);
            this.extractAvailableFilterOptions();
            this.applyFilter();
          },
          error: (error) => console.error('Erro ao carregar próximos a vencer:', error)
        });
        break;
      case 'hoje':
        this.muralService.getVencemHoje().subscribe({
          next: (items) => {
            this.items = items.filter(item => !item.inspecionado);
            this.extractAvailableFilterOptions();
            this.applyFilter();
          },
          error: (error) => console.error('Erro ao carregar vencem hoje:', error)
        });
        break;
      case 'vencido':
        this.muralService.getVencidos().subscribe({
          next: (items) => {
            this.items = items.filter(item => !item.inspecionado);
            this.extractAvailableFilterOptions();
            this.applyFilter();
          },
          error: (error) => console.error('Erro ao carregar vencidos:', error)
        });
        break;
    }
  }

  // Extrair todas as opções disponíveis para os filtros
  extractAvailableFilterOptions() {
    // Extrair marcas
    const brands = new Set<string>();
    const corredores = new Set<string>();
    const categorias = new Set<string>();
    const fornecedores = new Set<string>();
    const lotes = new Set<string>();

    this.items.forEach(item => {
      if (item.produto?.marca) {
        brands.add(item.produto.marca);
      }
      if (item.corredor) {
        corredores.add(item.corredor);
      }
      if (item.categoria) {
        categorias.add(item.categoria);
      }
      if (item.fornecedor) {
        fornecedores.add(item.fornecedor);
      }
      if (item.lote) {
        lotes.add(item.lote);
      }
    });

    this.availableBrands = Array.from(brands).sort();
    this.availableCorredores = Array.from(corredores).sort();
    this.availableCategorias = Array.from(categorias).sort();
    this.availableFornecedores = Array.from(fornecedores).sort();
    this.availableLotes = Array.from(lotes).sort();
  }

  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido') {
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

  // Função para aplicar filtros
  applyFilter() {
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

    // Filtro de marca
    if (this.advancedFilters.marca) {
      filtered = filtered.filter(item =>
        item.produto?.marca === this.advancedFilters.marca
      );
    }

    // Filtro de corredor
    if (this.advancedFilters.corredor) {
      filtered = filtered.filter(item => item.corredor === this.advancedFilters.corredor);
    }

    // Filtro de categoria
    if (this.advancedFilters.categoria) {
      filtered = filtered.filter(item => item.categoria === this.advancedFilters.categoria);
    }

    // Filtro de fornecedor
    if (this.advancedFilters.fornecedor) {
      filtered = filtered.filter(item => item.fornecedor === this.advancedFilters.fornecedor);
    }

    // Filtro de lote
    if (this.advancedFilters.lote) {
      filtered = filtered.filter(item => item.lote && item.lote.toLowerCase().includes(this.advancedFilters.lote.toLowerCase()));
    }

    // Filtro de data de vencimento
    if (this.advancedFilters.dataVencimento.startDate) {
      const startDate = new Date(this.advancedFilters.dataVencimento.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataValidade);
        return itemDate >= startDate;
      });
    }

    if (this.advancedFilters.dataVencimento.endDate) {
      const endDate = new Date(this.advancedFilters.dataVencimento.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.dataValidade);
        return itemDate <= endDate;
      });
    }

    // Filtro de data de fabricação
    if (this.advancedFilters.dataFabricacao.startDate) {
      const startDate = new Date(this.advancedFilters.dataFabricacao.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        if (!item.dataFabricacao) return false;
        const itemDate = new Date(item.dataFabricacao);
        return itemDate >= startDate;
      });
    }

    if (this.advancedFilters.dataFabricacao.endDate) {
      const endDate = new Date(this.advancedFilters.dataFabricacao.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.dataFabricacao) return false;
        const itemDate = new Date(item.dataFabricacao);
        return itemDate <= endDate;
      });
    }

    // Filtro de data de recebimento
    if (this.advancedFilters.dataRecebimento.startDate) {
      const startDate = new Date(this.advancedFilters.dataRecebimento.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => {
        if (!item.dataRecebimento) return false;
        const itemDate = new Date(item.dataRecebimento);
        return itemDate >= startDate;
      });
    }

    if (this.advancedFilters.dataRecebimento.endDate) {
      const endDate = new Date(this.advancedFilters.dataRecebimento.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        if (!item.dataRecebimento) return false;
        const itemDate = new Date(item.dataRecebimento);
        return itemDate <= endDate;
      });
    }

    this.filteredItems = filtered;
    this.sortItems();
  }

  // Função para abrir o modal de filtros avançados
  openFilterModal() {
    this.showFilterModal = true;
  }

  // Função para fechar o modal de filtros avançados
  closeFilterModal() {
    this.showFilterModal = false;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
    this.showCorredorDropdown = false;
    this.showCategoriaDropdown = false;
  }

  // Função para limpar todos os filtros avançados
  resetFilters() {
    this.advancedFilters = {
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
  }

  // Função para alternar a direção da ordenação
  toggleSortOrder() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortItems();
  }

  // Função para ordenar os itens
  sortItems() {
    this.filteredItems.sort((a, b) => {
      const descA = a.produto?.descricao?.toLowerCase() || '';
      const descB = b.produto?.descricao?.toLowerCase() || '';

      if (this.sortDirection === 'asc') {
        return descA.localeCompare(descB);
      } else {
        return descB.localeCompare(descA);
      }
    });
  }

  // Função para selecionar/desselecionar todos os itens
  selectAll(event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    this.filteredItems.forEach(item => {
      item.selecionado = checked;
    });
  }

  // Verificar se há itens selecionados
  hasSelectedItems(): boolean {
    return this.filteredItems.some(item => item.selecionado);
  }

  // Obter o número de itens selecionados
  getSelectedItemsCount(): number {
    return this.filteredItems.filter(item => item.selecionado).length;
  }

  // Marcar todos os itens selecionados como inspecionados
  marcarSelecionadosComoInspecionados() {
    const selectedItems = this.filteredItems.filter(item => item.selecionado);
    if (selectedItems.length === 0) return;

    // Extrair apenas os IDs dos itens selecionados
    const selectedIds = selectedItems.map(item => item.id);

    // Usar o novo endpoint para marcar vários itens de uma vez
    this.muralService.marcarVariosInspecionados(selectedIds).subscribe({
      next: () => {
        // Remover os itens inspecionados da lista
        this.items = this.items.filter(item =>
          !selectedIds.includes(item.id)
        );
        this.applyFilter();
      },
      error: (error) => console.error('Erro ao marcar itens como inspecionados:', error)
    });
  }

  // Métodos para o modal de filtros avançados
  loadFilterOptions(): void {
    // Inicializar as listas filtradas
    // Os dados reais serão preenchidos pelo método extractAvailableFilterOptions
    // quando os itens forem carregados do banco de dados
    this.filteredBrands = [...this.availableBrands];
    this.filteredFornecedores = [...this.availableFornecedores];
    this.filteredLotes = [...this.availableLotes];
    this.filteredCorredores = [...this.availableCorredores];
    this.filteredCategorias = [...this.availableCategorias];
  }

  // Verificar se há filtros aplicados
  hasAppliedFilters(): boolean {
    return !!(this.advancedFilters.marca ||
           this.advancedFilters.corredor ||
           this.advancedFilters.categoria ||
           this.advancedFilters.fornecedor ||
           this.advancedFilters.lote ||
           this.advancedFilters.dataVencimento.startDate ||
           this.advancedFilters.dataVencimento.endDate ||
           this.advancedFilters.dataFabricacao.startDate ||
           this.advancedFilters.dataFabricacao.endDate ||
           this.advancedFilters.dataRecebimento.startDate ||
           this.advancedFilters.dataRecebimento.endDate);
  }

  // Limpar um filtro específico
  clearFilter(filterName: string): void {
    if (filterName in this.advancedFilters) {
      (this.advancedFilters as any)[filterName] = '';
      this.applyFilter();
    }
  }

  // Limpar filtro de data
  clearDateFilter(): void {
    this.advancedFilters.dataVencimento.startDate = '';
    this.advancedFilters.dataVencimento.endDate = '';
    this.applyFilter();
  }

  // Limpar todos os filtros
  resetAllFilters(): void {
    this.resetFilters();
    this.applyFilter();
  }

  // Aplicar filtros avançados e fechar o modal
  applyAdvancedFilters(): void {
    this.applyFilter();
    this.closeFilterModal();
  }

  // Métodos para controle do dropdown de Marca
  toggleMarcaDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showMarcaDropdown = !this.showMarcaDropdown;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;

    // Se o dropdown estiver sendo aberto, reseta a lista filtrada
    if (this.showMarcaDropdown) {
      this.filterBrandOptions(this.advancedFilters.marca);
    }
  }

  filterBrandOptions(searchText: string) {
    if (!searchText || searchText.trim() === '') {
      // Se não houver texto de busca, mostrar todas as marcas
      this.filteredBrands = [...this.availableBrands];
    } else {
      // Caso contrário, filtrar as marcas que contêm o texto de busca
      const normalizedSearch = searchText.toLowerCase().trim();
      this.filteredBrands = this.availableBrands.filter(brand =>
        brand.toLowerCase().includes(normalizedSearch)
      );

      // Se nenhum resultado for encontrado, mostrar todas as marcas
      if (this.filteredBrands.length === 0) {
        this.filteredBrands = [...this.availableBrands];
      }
    }
  }

  selectBrand(brand: string) {
    this.advancedFilters.marca = brand;
    this.showMarcaDropdown = false;
  }

  // Métodos para controle do dropdown de Fornecedor
  toggleFornecedorDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showFornecedorDropdown = !this.showFornecedorDropdown;
    this.showMarcaDropdown = false;
    this.showLoteDropdown = false;

    // Se o dropdown estiver sendo aberto, reseta a lista filtrada
    if (this.showFornecedorDropdown) {
      this.filterFornecedorOptions(this.advancedFilters.fornecedor);
    }
  }

  filterFornecedorOptions(searchText: string) {
    if (!searchText || searchText.trim() === '') {
      // Se não houver texto de busca, mostrar todos os fornecedores
      this.filteredFornecedores = [...this.availableFornecedores];
    } else {
      // Caso contrário, filtrar os fornecedores que contêm o texto de busca
      const normalizedSearch = searchText.toLowerCase().trim();
      this.filteredFornecedores = this.availableFornecedores.filter(fornecedor =>
        fornecedor.toLowerCase().includes(normalizedSearch)
      );

      // Se nenhum resultado for encontrado, mostrar todos os fornecedores
      if (this.filteredFornecedores.length === 0) {
        this.filteredFornecedores = [...this.availableFornecedores];
      }
    }
  }

  selectFornecedor(fornecedor: string) {
    this.advancedFilters.fornecedor = fornecedor;
    this.showFornecedorDropdown = false;
  }

  // Métodos para controle do dropdown de Lote
  toggleLoteDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showLoteDropdown = !this.showLoteDropdown;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;

    // Se o dropdown estiver sendo aberto, reseta a lista filtrada
    if (this.showLoteDropdown) {
      this.filterLoteOptions(this.advancedFilters.lote);
    }
  }

  filterLoteOptions(searchText: string) {
    if (!searchText || searchText.trim() === '') {
      // Se não houver texto de busca, mostrar todos os lotes
      this.filteredLotes = [...this.availableLotes];
    } else {
      // Caso contrário, filtrar os lotes que contêm o texto de busca
      const normalizedSearch = searchText.toLowerCase().trim();
      this.filteredLotes = this.availableLotes.filter(lote =>
        lote.toLowerCase().includes(normalizedSearch)
      );

      // Se nenhum resultado for encontrado, mostrar todos os lotes
      if (this.filteredLotes.length === 0) {
        this.filteredLotes = [...this.availableLotes];
      }
    }
  }

  selectLote(lote: string) {
    this.advancedFilters.lote = lote;
    this.showLoteDropdown = false;
  }

  // Métodos para pesquisar explicitamente usando a lupa
  searchBrands(event: MouseEvent) {
    event.stopPropagation();
    this.filterBrandOptions(this.advancedFilters.marca);
    this.showMarcaDropdown = true;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
  }

  searchFornecedores(event: MouseEvent) {
    event.stopPropagation();
    this.filterFornecedorOptions(this.advancedFilters.fornecedor);
    this.showFornecedorDropdown = true;
    this.showMarcaDropdown = false;
    this.showLoteDropdown = false;
  }

  searchLotes(event: MouseEvent) {
    event.stopPropagation();
    this.filterLoteOptions(this.advancedFilters.lote);
    this.showLoteDropdown = true;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
  }

  // Métodos para controle do dropdown de Corredor
  toggleCorredorDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showCorredorDropdown = !this.showCorredorDropdown;
    this.showCategoriaDropdown = false;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;

    // Se o dropdown estiver sendo aberto, reseta a lista filtrada
    if (this.showCorredorDropdown) {
      this.filterCorredorOptions(this.advancedFilters.corredor);
    }
  }

  filterCorredorOptions(searchText: string) {
    if (!searchText || searchText.trim() === '') {
      // Se não houver texto de busca, mostrar todos os corredores
      this.filteredCorredores = [...this.availableCorredores];
    } else {
      // Caso contrário, filtrar os corredores que contêm o texto de busca
      const normalizedSearch = searchText.toLowerCase().trim();
      this.filteredCorredores = this.availableCorredores.filter(corredor =>
        corredor.toLowerCase().includes(normalizedSearch)
      );

      // Se nenhum resultado for encontrado, mostrar todos os corredores
      if (this.filteredCorredores.length === 0) {
        this.filteredCorredores = [...this.availableCorredores];
      }
    }
  }

  selectCorredor(corredor: string) {
    this.advancedFilters.corredor = corredor;
    this.showCorredorDropdown = false;
  }

  // Métodos para controle do dropdown de Categoria
  toggleCategoriaDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showCategoriaDropdown = !this.showCategoriaDropdown;
    this.showCorredorDropdown = false;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;

    // Se o dropdown estiver sendo aberto, reseta a lista filtrada
    if (this.showCategoriaDropdown) {
      this.filterCategoriaOptions(this.advancedFilters.categoria);
    }
  }

  filterCategoriaOptions(searchText: string) {
    if (!searchText || searchText.trim() === '') {
      // Se não houver texto de busca, mostrar todas as categorias
      this.filteredCategorias = [...this.availableCategorias];
    } else {
      // Caso contrário, filtrar as categorias que contêm o texto de busca
      const normalizedSearch = searchText.toLowerCase().trim();
      this.filteredCategorias = this.availableCategorias.filter(categoria =>
        categoria.toLowerCase().includes(normalizedSearch)
      );

      // Se nenhum resultado for encontrado, mostrar todas as categorias
      if (this.filteredCategorias.length === 0) {
        this.filteredCategorias = [...this.availableCategorias];
      }
    }
  }

  selectCategoria(categoria: string) {
    this.advancedFilters.categoria = categoria;
    this.showCategoriaDropdown = false;
  }

  // Métodos para pesquisar explicitamente usando a lupa
  searchCorredores(event: MouseEvent) {
    event.stopPropagation();
    this.filterCorredorOptions(this.advancedFilters.corredor);
    this.showCorredorDropdown = true;
    this.showCategoriaDropdown = false;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
  }

  searchCategorias(event: MouseEvent) {
    event.stopPropagation();
    this.filterCategoriaOptions(this.advancedFilters.categoria);
    this.showCategoriaDropdown = true;
    this.showCorredorDropdown = false;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MuralItem } from '../../../models/mural.model';
import { MuralFilterHandlerService } from '../../../services/mural-filter-handler.service';
import { MuralFilterService } from '../../../services/mural-filter.service';
import { MuralSelecaoService } from '../../../services/mural-selecao.service';
import { MuralService } from '../../../services/mural.service';
import { FiltroAvancadoComponent } from '../mural-filtros/avancado/filtro-avancado.component';
import { FiltroBasicoComponent } from '../mural-filtros/basico/filtro-basico.component';
import { FiltroTagsComponent } from '../mural-filtros/tags/filtro-tags.component';
import { ModalInspecaoComponent } from '../mural-modal-inspecao/modal-inspecao.component';
import { MuralTabsComponent } from '../mural-tabs/mural-tabs.component';

@Component({
  selector: 'app-mural-listagem',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FiltroAvancadoComponent,
    ModalInspecaoComponent,
    FiltroBasicoComponent,
    FiltroTagsComponent,
    MuralTabsComponent
  ],
  templateUrl: './mural-listagem.component.html',
  styleUrls: ['./mural-listagem.component.css']
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

  // -------------------- Controle de UI --------------------
  /** Visibilidade do modal de filtros avançados */
  showFilterModal: boolean = false;

  /** IDs dos itens selecionados */
  private selectedIds: string[] = [];

  /** Subscriptions para gerenciar unsubscribe */
  private subscriptions: Subscription[] = [];

  constructor(
    private muralService: MuralService,
    public filterService: MuralFilterService,
    private filterHandler: MuralFilterHandlerService,
    private selecaoService: MuralSelecaoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Inicialização do componente
   */
  ngOnInit(): void {
    this.initializeFromRouting();
    this.setupFilterSubscriptions();
    this.setupSelectionSubscription();
  }

  /**
   * Configura as assinaturas para a seleção de itens
   */
  private setupSelectionSubscription(): void {
    // Inscrever-se para mudanças nos itens selecionados
    const subscription = this.selecaoService.selectedItems$.subscribe(
      selectedIds => {
        this.selectedIds = selectedIds;
        // Atualizar o estado de seleção dos itens
        this.updateItemSelectionState();
      }
    );

    this.subscriptions.push(subscription);
  }

  /**
   * Atualiza o estado de seleção dos itens com base nos IDs selecionados
   */
  private updateItemSelectionState(): void {
    if (this.filteredItems && this.filteredItems.length > 0) {
      this.filteredItems.forEach(item => {
        item.selecionado = this.selectedIds.includes(item.id);
      });
    }
  }

  /**
   * Seleciona ou desmarca todos os itens
   */
  selectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    this.selecaoService.selectAll(this.filteredItems, checked);
    this.updateItemSelectionState();
  }

  /**
   * Handler para quando um item é selecionado individualmente
   */
  onItemSelection(item: MuralItem, selected: boolean): void {
    this.selecaoService.toggleItemSelection(item, selected);
  }

  /**
   * Limpeza ao destruir o componente
   */
  ngOnDestroy(): void {
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
   * Configura as assinaturas para os filtros
   */
  private setupFilterSubscriptions(): void {
    // Assinatura para o termo de pesquisa
    const searchSubscription = this.filterService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });

    // Assinatura para as mudanças nos filtros avançados
    const filtersSubscription = this.filterService.filters$.subscribe(() => {
      this.applyFilters();
    });

    this.subscriptions.push(searchSubscription, filtersSubscription);
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

        // Extrair opções de filtro
        this.extractAvailableFilterOptions();

        // Aplicar filtros atuais
        this.applyFilters();
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

    // Atualizar o service com as opções extraídas
    this.filterService.updateFilterOptions({
      availableBrands: Array.from(brands).sort(),
      availableCorredores: Array.from(corredores).sort(),
      availableCategorias: Array.from(categorias).sort(),
      availableFornecedores: Array.from(fornecedores).sort(),
      availableLotes: Array.from(lotes).sort()
    });
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
  applyFilters(): void {
    // Usar o serviço de tratamento de filtros para aplicar todos os filtros
    this.filteredItems = this.filterHandler.applyAllFilters(this.items, this.searchTerm);

    // Ordenar os itens
    this.sortItems();

    // Atualizar o estado de seleção após filtrar
    this.updateItemSelectionState();
  }

  /**
   * Atualiza o termo de pesquisa e aplica o filtro
   */
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.filterService.updateSearchTerm(term);
  }

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
  }

  /**
   * Limpa um filtro específico
   */
  clearFilter(filterName: string): void {
    this.filterService.clearFilter(filterName as any);
  }

  /**
   * Limpa o filtro de data de vencimento
   */
  clearDateFilter(): void {
    this.filterService.clearDateFilter('dataVencimento');
  }

  /**
   * Limpa todos os filtros
   */
  resetAllFilters(): void {
    this.filterService.resetFilters();
    this.searchTerm = '';
    this.filterService.updateSearchTerm('');
  }

  /**
   * Inverte a ordem de ordenação
   */
  toggleSortOrder(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortItems();
  }

  /**
   * Ordena os itens filtrados
   */
  sortItems(): void {
    this.filteredItems = this.filterHandler.sortItems(this.filteredItems, this.sortDirection);
  }

  /**
   * Ao confirmar a inspeção, atualiza os itens selecionados
   */
  onInspecaoConfirmada(): void {
    // Atualizar os itens após confirmação de inspeção
    const selectedItems = this.selecaoService.getSelectedItems(this.items);

    // Atualizar o estado de inspeção nos itens
    this.items = this.items.map(item => {
      if (selectedItems.some(selected => selected.id === item.id)) {
        return { ...item, inspecionado: true };
      }
      return item;
    });

    // Limpar seleção
    this.selecaoService.clearSelection();

    // Reaplicar filtros
    this.applyFilters();
  }

  /**
   * Verifica se há filtros aplicados
   */
  hasAppliedFilters(): boolean {
    return this.filterService.hasAppliedFilters() || !!this.searchTerm;
  }

  /**
   * Marca os itens selecionados como inspecionados
   */
  marcarSelecionadosComoInspecionados(): void {
    this.selecaoService.openInspecaoModal();
  }

  /**
   * Verifica se há itens selecionados
   */
  hasSelectedItems(): boolean {
    return this.selecaoService.hasSelectedItems();
  }

  /**
   * Obtém a contagem de itens selecionados
   */
  getSelectedItemsCount(): number {
    return this.selecaoService.getSelectedItemsCount();
  }
}

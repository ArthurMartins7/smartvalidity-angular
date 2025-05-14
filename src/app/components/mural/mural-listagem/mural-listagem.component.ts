import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { MuralListagemDTO } from '../../../shared/model/dto/mural.dto';
import { MuralFilter, MuralFilterService, MuralSelecaoService, MuralService } from '../../../shared/service/mural.service';
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
  /** Lista de itens filtrados atualmente visíveis */
  filteredItems: MuralListagemDTO[] = [];

  /** Aba ativa atual */
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';

  /** Termo de pesquisa para filtrar itens */
  searchTerm: string = '';

  /** Direção de ordenação atual */
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Campo de ordenação */
  sortField: string = '';

  // -------------------- Controle de UI --------------------
  /** Visibilidade do modal de filtros avançados */
  showFilterModal: boolean = false;

  /** Status de carregamento */
  loading: boolean = false;

  /** IDs dos itens selecionados */
  private selectedIds: string[] = [];

  /** Subscriptions para gerenciar unsubscribe */
  private subscriptions: Subscription[] = [];

  constructor(
    private muralService: MuralService,
    public filterService: MuralFilterService,
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
    this.loadFilterOptions();
  }

  /**
   * Carrega as opções para os filtros do backend
   */
  loadFilterOptions(): void {
    const subscription = this.muralService.getOpcoesFiltro().subscribe({
      next: (options) => {
        this.filterService.updateFilterOptions({
          availableBrands: options.marcas,
          availableCorredores: options.corredores,
          availableCategorias: options.categorias,
          availableFornecedores: options.fornecedores,
          availableLotes: options.lotes
        });
      },
      error: (error) => console.error('Erro ao carregar opções de filtro:', error)
    });

    this.subscriptions.push(subscription);
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
  onItemSelection(item: MuralListagemDTO, selected: boolean): void {
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
    // Combinar todas as assinaturas de filtro em uma só
    const subscription = combineLatest([
      this.filterService.searchTerm$,
      this.filterService.filters$,
      this.filterService.sortField$,
      this.filterService.sortDirection$
    ]).subscribe(([searchTerm, filters, sortField, sortDirection]) => {
      this.searchTerm = searchTerm;
      this.sortField = sortField;
      this.sortDirection = sortDirection;
      // Aplicar filtros sempre que qualquer um dos valores mudar
      this.applyFilters();
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Carrega os itens com base na aba ativa
   */
  loadItems(): void {
    // Garantir que todos os filtros serão aplicados após carregar os itens
    this.applyFilters();
  }

  /**
   * Aplica os filtros aos itens
   */
  applyFilters(): void {
    this.loading = true;

    // Converte o estado atual dos filtros para o DTO
    const filtroDTO = this.filterService.toFilterDTO();

    // Adiciona informação da aba ativa como um filtro adicional
    // (não altera o estado do filtro, apenas para a requisição atual)
    switch (this.activeTab) {
      case 'proximo':
        // Deixa como está, o backend filtrará para próximos a vencer
        filtroDTO.status = 'proximo';
        break;
      case 'hoje':
        // Adiciona filtro para itens que vencem hoje
        filtroDTO.status = 'hoje';
        break;
      case 'vencido':
        // Adiciona filtro para itens vencidos
        filtroDTO.status = 'vencido';
        break;
    }

    const subscription = this.muralService.filtrarProdutos(filtroDTO).subscribe({
      next: (items) => {
        this.filteredItems = items.map(item => {
          if (item.inspecionado === undefined || item.inspecionado === null) {
            item.inspecionado = false;
          }
          return item;
        });

        // Atualiza o estado de seleção dos itens
        this.updateItemSelectionState();
        this.loading = false;
      },
      error: (error) => {
        console.error(`Erro ao filtrar itens de ${this.activeTab}:`, error);
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Manipula a alteração do termo de pesquisa
   */
  onSearchChange(term: string): void {
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
    this.filterService.clearFilter(filterName as keyof MuralFilter);
  }

  /**
   * Limpa o filtro de data
   */
  clearDateFilter(): void {
    this.filterService.clearDateFilter('dataVencimento');
  }

  /**
   * Reseta todos os filtros
   */
  resetAllFilters(): void {
    this.filterService.resetFilters();
    this.filterService.updateSortField('');
    this.filterService.updateSortDirection('asc');
  }

  /**
   * Alterna a direção de ordenação
   */
  toggleSortOrder(): void {
    const newDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.filterService.updateSortDirection(newDirection);
    // Define o campo para ordenação como "nome" se não estiver definido
    if (!this.sortField) {
      this.filterService.updateSortField('nome');
    }
  }

  /**
   * Define o campo de ordenação
   */
  setSortField(field: string): void {
    // Se clicar no mesmo campo, inverte a direção
    if (this.sortField === field) {
      this.toggleSortOrder();
    } else {
      // Se mudar o campo, define a direção como ascendente
      this.filterService.updateSortField(field);
      this.filterService.updateSortDirection('asc');
    }
  }

  /**
   * Callback quando a inspeção é confirmada
   */
  onInspecaoConfirmada(): void {
    try {
      // Obtém o motivo da inspeção e os itens selecionados
      this.selecaoService.confirmarInspecao(this.filteredItems).subscribe({
        next: (itensAtualizados) => {
          console.log('Itens inspecionados com sucesso:', itensAtualizados);

          // Limpa a seleção
          this.selecaoService.clearSelection();

          // Fecha o modal
          this.selecaoService.closeInspecaoModal();

          // Recarrega os itens
          this.loadItems();
        },
        error: (err) => {
          console.error('Erro ao inspecionar itens:', err);
        }
      });
    } catch (error) {
      console.error('Erro ao confirmar inspeção:', error);
    }
  }

  /**
   * Verifica se há filtros aplicados
   */
  hasAppliedFilters(): boolean {
    return this.filterService.hasAppliedFilters() || !!this.searchTerm;
  }

  /**
   * Abre o modal para marcar itens selecionados como inspecionados
   */
  marcarSelecionadosComoInspecionados(): void {
    if (this.hasSelectedItems()) {
      this.selecaoService.openInspecaoModal();
    }
  }

  /**
   * Verifica se há itens selecionados
   */
  hasSelectedItems(): boolean {
    return this.selectedIds.length > 0;
  }

  /**
   * Retorna o número de itens selecionados
   */
  getSelectedItemsCount(): number {
    return this.selectedIds.length;
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
}

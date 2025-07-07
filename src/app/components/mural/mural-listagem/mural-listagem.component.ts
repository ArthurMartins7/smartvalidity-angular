import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { MuralFiltroDTO, MuralListagemDTO } from '../../../shared/model/dto/mural.dto';
import { MuralFilter, MuralFilterService, MuralSelecaoService, MuralService } from '../../../shared/service/mural.service';
import { RelatorioService } from '../../../shared/service/relatorio.service';
import { FiltroAvancadoComponent } from '../mural-filtros/avancado/filtro-avancado.component';
import { FiltroBasicoComponent } from '../mural-filtros/basico/filtro-basico.component';
import { FiltroTagsComponent } from '../mural-filtros/tags/filtro-tags.component';
import { ModalAcoesComponent } from '../mural-modal-acoes/modal-acoes.component';
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
    MuralTabsComponent,
    ModalAcoesComponent
  ],
  templateUrl: './mural-listagem.component.html',
  styleUrls: ['./mural-listagem.component.css']
})
export class MuralListagemComponent implements OnInit, OnDestroy {
  filteredItems: MuralListagemDTO[] = [];
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';
  searchTerm: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField: string = '';
  filtroInspecao: 'todos' | 'inspecionados' | 'naoInspecionados' = 'todos';
  showFilterModal: boolean = false;
  loading: boolean = false;
  private selectedIds: string[] = [];
  private subscriptions: Subscription[] = [];
  public totalPaginas: number = 1;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public totalItensAba: number = 0;
  public get paginaAtual(): number {
    return this.filterService['paginaAtualSubject'].value;
  }
  public get itensPorPagina(): number {
    return this.filterService['itensPorPaginaSubject'].value;
  }
  constructor(
    private muralService: MuralService,
    public filterService: MuralFilterService,
    private selecaoService: MuralSelecaoService,
    private relatorioService: RelatorioService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.initializeFromRouting();
    this.setupFilterSubscriptions();
    this.setupSelectionSubscription();
    this.loadFilterOptions();
  }
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
  private setupSelectionSubscription(): void {
    const subscription = this.selecaoService.selectedItems$.subscribe(
      selectedIds => {
        this.selectedIds = selectedIds;
        this.updateItemSelectionState();
      }
    );
    this.subscriptions.push(subscription);
  }
  private updateItemSelectionState(): void {
    if (this.filteredItems && this.filteredItems.length > 0) {
      this.filteredItems.forEach(item => {
        item.selecionado = this.selectedIds.includes(item.id);
      });
    }
  }
  selectAll(event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    this.selecaoService.selectAll(this.filteredItems, checked);
    this.updateItemSelectionState();
  }
  onItemSelection(item: MuralListagemDTO, selected: boolean): void {
    this.selecaoService.toggleItemSelection(item, selected);
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  private initializeFromRouting(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (state) {
      if ('activeTab' in state) {
        this.activeTab = state['activeTab'] as 'proximo' | 'hoje' | 'vencido';
      }
      if (!state['preserveFilters']) {
        this.filterService.resetFilters();
        this.filterService.updatePaginaAtual(1);
        this.filtroInspecao = 'todos';
      } else {
        this.filtroInspecao = this.filterService.getInspecaoFilter();
      }
      this.loadItems();
    } else {
      const subscription = this.route.queryParams.subscribe(params => {
        if (params['tab']) {
          const newTab = params['tab'] as 'proximo' | 'hoje' | 'vencido';
          if (newTab !== this.activeTab) {
            this.activeTab = newTab;
            this.filterService.updatePaginaAtual(1);
          }
        }
        this.filtroInspecao = this.filterService.getInspecaoFilter();
        this.loadItems();
      });
      this.subscriptions.push(subscription);
    }
  }
  private setupFilterSubscriptions(): void {
    const subscription = combineLatest([
      this.filterService.searchTerm$,
      this.filterService.filters$,
      this.filterService.sortField$,
      this.filterService.sortDirection$
    ]).subscribe(([searchTerm, filters, sortField, sortDirection]) => {
      this.searchTerm = searchTerm;
      this.sortField = sortField;
      this.sortDirection = sortDirection;
      this.applyFilters();
    });
    this.subscriptions.push(subscription);
  }
  loadItems(): void {
    this.applyFilters();
  }
  applyFilters(): void {
    this.loading = true;
    const filtroDTO = this.filterService.toFilterDTO();
    switch (this.activeTab) {
      case 'proximo':
        filtroDTO.status = 'proximo';
        break;
      case 'hoje':
        filtroDTO.status = 'hoje';
        break;
      case 'vencido':
        filtroDTO.status = 'vencido';
        break;
    }
    if (this.filtroInspecao === 'inspecionados') {
      filtroDTO.inspecionado = true;
    } else if (this.filtroInspecao === 'naoInspecionados') {
      filtroDTO.inspecionado = false;
    }
    let sortDirectionToSend = this.sortDirection;
    if (this.activeTab === 'vencido' && this.sortField === 'dataVencimento') {
      sortDirectionToSend = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    filtroDTO.sortDirection = sortDirectionToSend;
    this.calcularTotalPaginas(filtroDTO);
    this.selecaoService.updateTotalItensAba(filtroDTO);
    const subscription = this.muralService.filtrarProdutos(filtroDTO).subscribe({
      next: (items) => {
        this.filteredItems = items.map(item => {
          if (item.inspecionado === undefined || item.inspecionado === null) {
            item.inspecionado = false;
          }
          return item;
        });
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
  onSearchChange(term: string): void {
    // Só aplica a busca se tem pelo menos 3 caracteres ou está vazio (para limpar)
    if (!term || term.trim().length === 0 || term.trim().length >= 3) {
      this.filterService.updateSearchTerm(term);
    }
  }
  openFilterModal(): void {
    this.showFilterModal = true;
  }
  closeFilterModal(): void {
    this.showFilterModal = false;
  }
  clearFilter(filterName: string): void {
    this.filterService.clearFilter(filterName as keyof MuralFilter);
    this.applyFilters();
  }
  clearDateFilter(): void {
    this.filterService.clearDateFilter('dataVencimento');
    this.applyFilters();
  }
  clearSpecificDateFilter(dateType: string): void {
    if (dateType === 'dataVencimento' || dateType === 'dataFabricacao' || dateType === 'dataRecebimento') {
      this.filterService.clearSpecificDateFilter(dateType as 'dataVencimento' | 'dataFabricacao' | 'dataRecebimento');
      this.applyFilters();
    }
  }
  resetAllFilters(): void {
    this.filterService.resetFilters();
    this.filterService.updateSortField('');
    this.filterService.updateSortDirection('asc');
  }
  toggleSortOrder(): void {
    const newDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.filterService.updateSortDirection(newDirection);
    if (!this.sortField) {
      this.filterService.updateSortField('nome');
    }
  }
  setSortField(field: string): void {
    if (this.sortField === field) {
      this.toggleSortOrder();
    } else {
      this.filterService.updateSortField(field);
      this.filterService.updateSortDirection('asc');
    }
  }
  onSortOptionSelected(option: {field: string, direction: 'asc' | 'desc'}): void {
    this.filterService.updateSortField(option.field);
    this.filterService.updateSortDirection(option.direction);
    this.filterService.updatePaginaAtual(1);
    this.applyFilters();
  }
  onInspecaoConfirmada(): void {
    try {
      this.selecaoService.confirmarInspecao(this.filteredItems).subscribe({
        next: (itensAtualizados) => {
          console.log('Itens inspecionados com sucesso:', itensAtualizados);
          this.selecaoService.clearSelection();
          this.selecaoService.closeInspecaoModal();
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
  hasAppliedFilters(): boolean {
    return this.filterService.hasAppliedFilters() || !!this.searchTerm;
  }
  marcarSelecionadosComoInspecionados(): void {
    if (this.hasSelectedItems()) {
      this.selecaoService.openInspecaoModal();
    }
  }
  hasSelectedItems(): boolean {
    return this.selectedIds.length > 0;
  }
  getSelectedItemsCount(): number {
    return this.selectedIds.length;
  }
  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido'): void {
    this.activeTab = tab;
    this.filterService.updatePaginaAtual(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.loadItems();
  }
  private calcularTotalPaginas(filtro: MuralFiltroDTO): void {
    this.muralService.contarTotalRegistros(filtro).subscribe({
      next: (totalRegistros) => {
        this.totalItensAba = totalRegistros;
        this.totalPaginas = Math.ceil(totalRegistros / this.itensPorPagina);
        this.filterService.updateTotalPaginas(this.totalPaginas);
      },
      error: (erro) => {
        console.error('Erro ao contar total de registros:', erro);
        this.totalPaginas = 1;
        this.totalItensAba = 0;
        this.filterService.updateTotalPaginas(1);
      }
    });
  }
  public avancarPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.filterService.updatePaginaAtual(this.paginaAtual + 1);
      this.applyFilters();
    }
  }
  public voltarPagina(): void {
    if (this.paginaAtual > 1) {
      this.filterService.updatePaginaAtual(this.paginaAtual - 1);
      this.applyFilters();
    }
  }
  public irParaPagina(pagina: number): void {
    if (pagina !== this.paginaAtual) {
      this.filterService.updatePaginaAtual(pagina);
      this.applyFilters();
    }
  }
  public criarArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }
  public alterarItensPorPagina(quantidade: number): void {
    this.filterService.updateItensPorPagina(quantidade);
    this.applyFilters();
  }
  gerarRelatorio(): void {
    this.relatorioService.gerarRelatorioMural(
      'PAGINA',
      null,
      this.filterService.toFilterDTO(),
      this.activeTab
    ).subscribe({
      next: (response) => {
        this.relatorioService.downloadArquivo(response);
      },
      error: (erro) => {
        console.error('Erro ao gerar relatório:', erro);
      }
    });
  }
  gerarRelatorioSelecionados(): void {
    const itensSelecionados = this.filteredItems.filter(item => item.selecionado);
    if (itensSelecionados.length === 0) return;
    const ids = itensSelecionados.map(item => item.id);
    this.relatorioService.gerarRelatorioMural(
      'SELECIONADOS',
      ids,
      this.filterService.toFilterDTO(),
      this.activeTab
    ).subscribe({
      next: (response) => {
        this.relatorioService.downloadArquivo(response);
        this.selecaoService.clearSelection();
      },
      error: (erro) => {
        console.error('Erro ao gerar relatório:', erro);
      }
    });
  }
  private gerarRelatorioPaginaAtual(): void {
    if (this.filteredItems.length === 0) return;
    const ids = this.filteredItems.map(item => item.id);
    this.relatorioService.gerarRelatorioMural(
      'SELECIONADOS',
      ids,
      this.filterService.toFilterDTO(),
      this.activeTab
    ).subscribe({
      next: (response) => {
        this.relatorioService.downloadArquivo(response);
      },
      error: (erro) => {
        console.error('Erro ao gerar relatório:', erro);
      }
    });
  }
  private gerarRelatorioTodosItens(): void {
    const filtro = this.filterService.toFilterDTO();
    filtro.status = this.activeTab;
    this.relatorioService.gerarRelatorioMural(
      'TODOS',
      null,
      filtro,
      this.activeTab
    ).subscribe({
      next: (response) => {
        this.relatorioService.downloadArquivo(response);
      },
      error: (erro) => {
        console.error('Erro ao gerar relatório:', erro);
      }
    });
  }
  filtrarPorStatusInspecao(status: 'todos' | 'inspecionados' | 'naoInspecionados'): void {
    this.filtroInspecao = status;
    this.filterService.updatePaginaAtual(1);
    this.filterService.updateInspecaoFilter(status);
    this.applyFilters();
  }
  abrirModalAcoes(): void {
    if (this.hasSelectedItems()) {
      this.selecaoService.openAcoesModal();
    }
  }
  onAcaoSelecionada(acao: 'relatorio-selecionados' | 'relatorio-pagina' | 'relatorio-todos' | 'inspecao'): void {
    switch (acao) {
      case 'relatorio-selecionados':
        this.gerarRelatorioSelecionados();
        break;
      case 'relatorio-pagina':
        this.gerarRelatorioPaginaAtual();
        break;
      case 'relatorio-todos':
        this.gerarRelatorioTodosItens();
        break;
      case 'inspecao':
        this.marcarSelecionadosComoInspecionados();
        break;
    }
  }
  cancelarSelecao(): void {
    this.selecaoService.cancelarSelecaoBackend().subscribe({
      next: () => {
        this.selecaoService.clearSelection();
      },
      error: (err) => {
        this.selecaoService.clearSelection();
      }
    });
  }
  isAllSelectedOnPage(): boolean {
    return this.filteredItems.length > 0 && this.filteredItems.every(item => this.selectedIds.includes(item.id));
  }
  get nomeAbaAtual(): string {
    switch (this.activeTab) {
      case 'proximo': return 'Próximos a vencer';
      case 'hoje': return 'Vencem hoje';
      case 'vencido': return 'Vencidos';
      default: return '';
    }
  }
  get descricaoAbaAtual(): string {
    switch (this.activeTab) {
      case 'proximo': return 'Monitore produtos próximos ao vencimento (em até 15 dias). Gerencie inspeções e gere relatórios.';
      case 'hoje': return 'Produtos com vencimento hoje. Ação imediata necessária. Realize inspeções e tome as medidas adequadas.';
      case 'vencido': return 'Produtos já vencidos. Verifique o status e tome as ações necessárias para evitar perdas.';
      default: return 'Monitore produtos próximos ao vencimento (em até 15 dias), que vencem hoje e vencidos. Gerencie inspeções e gere relatórios.';
    }
  }
  onRemoveFilterValue(event: {filterName: string, value: string}): void {
    this.filterService.removeFilterValue(event.filterName as keyof MuralFilter, event.value);
    this.applyFilters();
  }
}

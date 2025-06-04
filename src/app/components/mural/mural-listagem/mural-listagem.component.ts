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

  /** Status de filtro de inspeção */
  filtroInspecao: 'todos' | 'inspecionados' | 'naoInspecionados' = 'todos';

  // -------------------- Controle de UI --------------------
  /** Visibilidade do modal de filtros avançados */
  showFilterModal: boolean = false;

  /** Status de carregamento */
  loading: boolean = false;

  /** IDs dos itens selecionados */
  private selectedIds: string[] = [];

  /** Subscriptions para gerenciar unsubscribe */
  private subscriptions: Subscription[] = [];

  /** Propriedades de paginação */
  public totalPaginas: number = 1;
  public opcoesItensPorPagina: number[] = [5, 10, 15, 20, 25, 50];
  public totalItensAba: number = 0;

  // Getters para acessar valores do filterService de forma mais limpa
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
    const state = navigation?.extras?.state;

    // Se houver state, verificamos a aba ativa e se devemos preservar os filtros
    if (state) {
      if ('activeTab' in state) {
        this.activeTab = state['activeTab'] as 'proximo' | 'hoje' | 'vencido';
      }

      // Se não estamos preservando os filtros explicitamente, resetamos
      if (!state['preserveFilters']) {
        this.filterService.resetFilters();
        this.filterService.updatePaginaAtual(1);
        this.filtroInspecao = 'todos'; // Reset do filtro de inspeção
      } else {
        // Restaurar o estado do filtro de inspeção
        this.filtroInspecao = this.filterService.getInspecaoFilter();
      }
      // Se estamos preservando os filtros, mantemos o estado atual
      this.loadItems();
    } else {
      // Se não houver estado na navegação, verificamos os parâmetros da URL
      const subscription = this.route.queryParams.subscribe(params => {
        if (params['tab']) {
          const newTab = params['tab'] as 'proximo' | 'hoje' | 'vencido';
          // Verificar se a aba mudou antes de redefinir a página
          if (newTab !== this.activeTab) {
            this.activeTab = newTab;
            // Redefinir para a página 1 quando a aba muda
            this.filterService.updatePaginaAtual(1);
          }
        }
        // Restaurar o estado do filtro de inspeção mesmo sem state
        this.filtroInspecao = this.filterService.getInspecaoFilter();
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

    // Adiciona filtro de status de inspeção, se aplicável
    if (this.filtroInspecao === 'inspecionados') {
      filtroDTO.inspecionado = true;
    } else if (this.filtroInspecao === 'naoInspecionados') {
      filtroDTO.inspecionado = false;
    }

    // --- INÍCIO DO AJUSTE DE ORDENAÇÃO PARA ABA VENCIDOS ---
    let sortDirectionToSend = this.sortDirection;
    if (this.activeTab === 'vencido' && this.sortField === 'dataVencimento') {
      sortDirectionToSend = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    filtroDTO.sortDirection = sortDirectionToSend;
    // --- FIM DO AJUSTE DE ORDENAÇÃO ---

    // Calcular o total de páginas e o total de itens
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
   * Recebe a seleção de opção de ordenação do dropdown
   */
  onSortOptionSelected(option: {field: string, direction: 'asc' | 'desc'}): void {
    // Atualiza o campo de ordenação e a direção
    this.filterService.updateSortField(option.field);
    this.filterService.updateSortDirection(option.direction);

    // Força a página para 1 ao mudar a ordenação
    this.filterService.updatePaginaAtual(1);

    // Aplica os filtros com a nova ordenação
    this.applyFilters();
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

    // Redefinir para a página 1 sempre que mudar de aba
    this.filterService.updatePaginaAtual(1);

    // Atualiza a URL sem recarregar a página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.loadItems();
  }

  // Método para calcular o total de páginas
  private calcularTotalPaginas(filtro: MuralFiltroDTO): void {
    // Primeiro obtém o total de registros
    this.muralService.contarTotalRegistros(filtro).subscribe({
      next: (totalRegistros) => {
        // Atualiza o total de itens na aba
        this.totalItensAba = totalRegistros;
        // Calcula o total de páginas
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

  // Método para avançar para a próxima página
  public avancarPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.filterService.updatePaginaAtual(this.paginaAtual + 1);
      this.applyFilters();
    }
  }

  // Método para voltar para a página anterior
  public voltarPagina(): void {
    if (this.paginaAtual > 1) {
      this.filterService.updatePaginaAtual(this.paginaAtual - 1);
      this.applyFilters();
    }
  }

  // Método para ir para uma página específica
  public irParaPagina(pagina: number): void {
    if (pagina !== this.paginaAtual) {
      this.filterService.updatePaginaAtual(pagina);
      this.applyFilters();
    }
  }

  // Método para criar um array com os números das páginas
  public criarArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Método para alterar a quantidade de itens por página
  public alterarItensPorPagina(quantidade: number): void {
    this.filterService.updateItensPorPagina(quantidade);
    this.applyFilters();
  }

  /**
   * Gera relatório Excel com os dados atualmente filtrados
   */
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
        // TODO: Mostrar mensagem de erro para o usuário
      }
    });
  }

  /**
   * Gera relatório Excel apenas com os itens selecionados
   */
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
        // TODO: Mostrar mensagem de erro para o usuário
      }
    });
  }

  /**
   * Gera relatório Excel com os itens da página atual
   */
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
        // TODO: Mostrar mensagem de erro para o usuário
      }
    });
  }

  /**
   * Gera relatório com todos os itens de todas as páginas
   */
  private gerarRelatorioTodosItens(): void {
    const filtro = this.filterService.toFilterDTO();
    filtro.status = this.activeTab; // Garante que o status da aba está incluso

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
        // TODO: Mostrar mensagem de erro para o usuário
      }
    });
  }

  /**
   * Filtra os itens por status de inspeção
   * @param status Status de inspeção a ser filtrado ('todos', 'inspecionados', 'naoInspecionados')
   */
  filtrarPorStatusInspecao(status: 'todos' | 'inspecionados' | 'naoInspecionados'): void {
    this.filtroInspecao = status;

    // Redefinir para a página 1 ao mudar o filtro
    this.filterService.updatePaginaAtual(1);

    // Salvar o estado do filtro de inspeção
    this.filterService.updateInspecaoFilter(status);

    // Aplicar os filtros
    this.applyFilters();
  }

  /**
   * Abre o modal de ações em lote
   */
  abrirModalAcoes(): void {
    if (this.hasSelectedItems()) {
      this.selecaoService.openAcoesModal();
    }
  }

  /**
   * Handler para ações selecionadas no modal de ações
   */
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

  // Adicionar método para verificar se todos os itens da página estão selecionados
  isAllSelectedOnPage(): boolean {
    return this.filteredItems.length > 0 && this.filteredItems.every(item => this.selectedIds.includes(item.id));
  }

  /** Retorna o nome amigável da aba atual */
  get nomeAbaAtual(): string {
    switch (this.activeTab) {
      case 'proximo': return 'Próximos a vencer';
      case 'hoje': return 'Vencem hoje';
      case 'vencido': return 'Vencidos';
      default: return '';
    }
  }
}

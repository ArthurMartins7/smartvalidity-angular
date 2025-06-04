import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralFilter, MuralFilterOptions, MuralFilterService, MuralService } from '../../../../shared/service/mural.service';

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface SearchTerms {
  corredor: string;
  categoria: string;
  marca: string;
  fornecedor: string;
  lote: string;
  colaborador: string;
}

@Component({
  selector: 'app-filtro-avancado',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './filtro-avancado.component.html',
  styleUrls: ['./filtro-avancado.component.css']
})
export class FiltroAvancadoComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  // Lista de motivos de inspeção
  motivosInspecao: string[] = [
    'Avaria/Quebra',
    'Promoção',
    'Outro'
  ];

  // Estado temporário dos filtros que são aplicados apenas quando o usuário confirma
  tempFilters: MuralFilter = this.initializeFilters();

  // Filtros selecionados atualmente
  selectedFilters: MuralFilter = {
    marca: [],
    corredor: [],
    categoria: [],
    fornecedor: [],
    lote: [],
    dataVencimento: { startDate: null, endDate: null },
    dataFabricacao: undefined,
    dataRecebimento: undefined,
    inspecionado: undefined,
    motivoInspecao: [],
    usuarioInspecao: []
  };

  // Opções disponíveis para os filtros
  filterOptions: MuralFilterOptions = {
    availableBrands: [],
    availableCorredores: [],
    availableCategorias: [],
    availableFornecedores: [],
    availableLotes: [],
    availableUsuariosInspecao: []
  };

  // Variáveis para os termos de pesquisa
  searchTerms: SearchTerms = {
    corredor: '',
    categoria: '',
    marca: '',
    fornecedor: '',
    lote: '',
    colaborador: ''
  };

  // Variáveis para controlar a exibição dos dropdowns
  showMarcaDropdown: boolean = false;
  showCorredorDropdown: boolean = false;
  showCategoriaDropdown: boolean = false;
  showFornecedorDropdown: boolean = false;
  showLoteDropdown: boolean = false;
  showUsuarioInspecaoDropdown: boolean = false;

  // Listas filtradas para cada dropdown
  filteredBrands: string[] = [];
  filteredCorredores: string[] = [];
  filteredCategorias: string[] = [];
  filteredFornecedores: string[] = [];
  filteredLotes: string[] = [];
  filteredUsuariosInspecao: string[] = [];

  // Timers para o blur
  private dropdownTimers: { [key: string]: any } = {};

  private subscriptions: Subscription[] = [];

  // Indicadores de carregamento
  isLoading: boolean = false;

  constructor(
    private muralFilterService: MuralFilterService,
    private muralService: MuralService
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Fecha os dropdowns se clicar fora deles
    if (!target.closest('.relative')) {
      this.showMarcaDropdown = false;
      this.showCorredorDropdown = false;
      this.showCategoriaDropdown = false;
      this.showFornecedorDropdown = false;
      this.showLoteDropdown = false;
      this.showUsuarioInspecaoDropdown = false;
    }
  }

  private initializeFilters(): MuralFilter {
    return {
      marca: [],
      corredor: [],
      categoria: [],
      fornecedor: [],
      lote: [],
      dataVencimento: { startDate: null, endDate: null },
      dataFabricacao: { startDate: null, endDate: null },
      dataRecebimento: { startDate: null, endDate: null },
      inspecionado: undefined,
      motivoInspecao: [],
      usuarioInspecao: []
    };
  }

  ngOnInit(): void {
    // Carregar as opções de filtro ao inicializar o componente
    this.loadInitialData();
  }

  private loadInitialData(): void {
    console.log('Iniciando carregamento dos dados do filtro avançado...');
    this.isLoading = true;

    // Carregar as opções de filtro
    this.muralFilterService.loadFilterOptions();

    // Inscrever-se para receber os filtros atuais
    this.subscriptions.push(
      this.muralFilterService.filters$.subscribe({
        next: (filters) => {
          console.log('Filtros atualizados:', filters);
          // Garantir que os objetos de data existam
          this.tempFilters = {
            ...filters,
            dataVencimento: filters.dataVencimento || { startDate: null, endDate: null },
            dataFabricacao: filters.dataFabricacao || { startDate: null, endDate: null },
            dataRecebimento: filters.dataRecebimento || { startDate: null, endDate: null }
          };
        },
        error: (error) => {
          console.error('Erro ao carregar filtros:', error);
          this.isLoading = false;
        }
      })
    );

    // Inscrever-se para receber atualizações das opções de filtro
    this.subscriptions.push(
      this.muralFilterService.filterOptions$.subscribe({
        next: (options) => {
          console.log('Opções de filtro carregadas:', options);
          this.filterOptions = options;

          // Inicializar as listas filtradas com todas as opções disponíveis
          this.filteredBrands = [...this.filterOptions.availableBrands];
          this.filteredCorredores = [...this.filterOptions.availableCorredores];
          this.filteredCategorias = [...this.filterOptions.availableCategorias];
          this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
          this.filteredLotes = [...this.filterOptions.availableLotes];
          this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];

          // Atualizar os campos de busca se já houver valores selecionados
          if (this.tempFilters.marca && this.tempFilters.marca.length > 0) {
            this.searchTerms.marca = this.tempFilters.marca.join(', ');
          }
          if (this.tempFilters.corredor && this.tempFilters.corredor.length > 0) {
            this.searchTerms.corredor = this.tempFilters.corredor.join(', ');
          }
          if (this.tempFilters.categoria && this.tempFilters.categoria.length > 0) {
            this.searchTerms.categoria = this.tempFilters.categoria.join(', ');
          }
          if (this.tempFilters.fornecedor && this.tempFilters.fornecedor.length > 0) {
            this.searchTerms.fornecedor = this.tempFilters.fornecedor.join(', ');
          }
          if (this.tempFilters.lote && this.tempFilters.lote.length > 0) {
            this.searchTerms.lote = this.tempFilters.lote.join(', ');
          }
          if (this.tempFilters.usuarioInspecao && this.tempFilters.usuarioInspecao.length > 0) {
            this.searchTerms.colaborador = this.tempFilters.usuarioInspecao.join(', ');
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar opções de filtro:', error);
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Cancela todos os timers pendentes
    Object.values(this.dropdownTimers).forEach(timer => {
      if (timer) {
        clearTimeout(timer);
      }
    });

    // Desinscreve de todas as assinaturas para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Funções para lidar com a pesquisa nos campos
   */
  onMarcaSearch(): void {
    const searchTerm = this.searchTerms.marca.toLowerCase();

    if (!searchTerm) {
      this.filteredBrands = [...this.filterOptions.availableBrands];
    } else {
      this.filteredBrands = this.filterOptions.availableBrands.filter(
        brand => brand.toLowerCase().includes(searchTerm)
      );
    }
  }

  onCorredorSearch(): void {
    const searchTerm = this.searchTerms.corredor.toLowerCase();

    if (!searchTerm) {
      this.filteredCorredores = [...this.filterOptions.availableCorredores];
    } else {
      this.filteredCorredores = this.filterOptions.availableCorredores.filter(
        corredor => corredor.toLowerCase().includes(searchTerm)
      );
    }
  }

  onCategoriaSearch(): void {
    const searchTerm = this.searchTerms.categoria.toLowerCase();

    if (!searchTerm) {
      this.filteredCategorias = [...this.filterOptions.availableCategorias];
    } else {
      this.filteredCategorias = this.filterOptions.availableCategorias.filter(
        categoria => categoria.toLowerCase().includes(searchTerm)
      );
    }
  }

  onFornecedorSearch(): void {
    const searchTerm = this.searchTerms.fornecedor.toLowerCase();

    if (!searchTerm) {
      this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
    } else {
      this.filteredFornecedores = this.filterOptions.availableFornecedores.filter(
        fornecedor => fornecedor.toLowerCase().includes(searchTerm)
      );
    }
  }

  onLoteSearch(): void {
    const searchTerm = this.searchTerms.lote.toLowerCase();

    if (!searchTerm) {
      this.filteredLotes = [...this.filterOptions.availableLotes];
    } else {
      this.filteredLotes = this.filterOptions.availableLotes.filter(
        lote => lote.toLowerCase().includes(searchTerm)
      );
    }
  }

  onColaboradorFocus(): void {
    // Reseta a lista filtrada para mostrar todos os usuários
    this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];
    // Mostra o dropdown
    this.showUsuarioInspecaoDropdown = true;
  }

  onColaboradorSearch(): void {
    const searchTerm = this.searchTerms.colaborador.toLowerCase();

    if (!searchTerm) {
      this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];
    } else {
      this.filteredUsuariosInspecao = this.filterOptions.availableUsuariosInspecao.filter(
        usuario => usuario.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Seleciona uma opção de um dropdown
   */
  selectOption(field: string, value: string): void {
    switch (field) {
      case 'marca':
        if (!this.tempFilters.marca.includes(value)) {
          this.tempFilters.marca = [...this.tempFilters.marca, value];
        }
        this.searchTerms.marca = value;
        this.showMarcaDropdown = false;
        break;
      case 'corredor':
        if (!this.tempFilters.corredor.includes(value)) {
          this.tempFilters.corredor = [...this.tempFilters.corredor, value];
        }
        this.searchTerms.corredor = value;
        this.showCorredorDropdown = false;
        break;
      case 'categoria':
        if (!this.tempFilters.categoria.includes(value)) {
          this.tempFilters.categoria = [...this.tempFilters.categoria, value];
        }
        this.searchTerms.categoria = value;
        this.showCategoriaDropdown = false;
        break;
      case 'fornecedor':
        if (!this.tempFilters.fornecedor.includes(value)) {
          this.tempFilters.fornecedor = [...this.tempFilters.fornecedor, value];
        }
        this.searchTerms.fornecedor = value;
        this.showFornecedorDropdown = false;
        break;
      case 'lote':
        if (!this.tempFilters.lote.includes(value)) {
          this.tempFilters.lote = [...this.tempFilters.lote, value];
        }
        this.searchTerms.lote = value;
        this.showLoteDropdown = false;
        break;
      case 'usuarioInspecao':
        if (!this.tempFilters.usuarioInspecao.includes(value)) {
          this.tempFilters.usuarioInspecao = [...this.tempFilters.usuarioInspecao, value];
        }
        this.searchTerms.colaborador = value;
        this.showUsuarioInspecaoDropdown = false;
        break;
    }
  }

  /**
   * Fecha o dropdown com um pequeno atraso para permitir cliques nas opções
   */
  onBlurWithDelay(field: string): void {
    // Cancela o timer anterior se existir
    if (this.dropdownTimers[field]) {
      clearTimeout(this.dropdownTimers[field]);
    }

    // Define um novo timer
    this.dropdownTimers[field] = setTimeout(() => {
      switch (field) {
        case 'marca':
          this.showMarcaDropdown = false;
          break;
        case 'corredor':
          this.showCorredorDropdown = false;
          break;
        case 'categoria':
          this.showCategoriaDropdown = false;
          break;
        case 'fornecedor':
          this.showFornecedorDropdown = false;
          break;
        case 'lote':
          this.showLoteDropdown = false;
          break;
      }
    }, 200);
  }

  /**
   * Aplica os filtros temporários ao serviço
   */
  applyFilters(): void {
    this.muralFilterService.updateFilters(this.tempFilters);
    this.closeModal();
  }

  /**
   * Cancela as alterações e fecha o modal
   */
  cancelFilters(): void {
    this.closeModal();
  }

  /**
   * Limpa todos os filtros temporários
   */
  clearAllFilters(): void {
    this.tempFilters = this.initializeFilters();

    // Limpa também os campos de pesquisa
    this.searchTerms.corredor = '';
    this.searchTerms.categoria = '';
    this.searchTerms.marca = '';
    this.searchTerms.fornecedor = '';
    this.searchTerms.lote = '';
    this.searchTerms.colaborador = '';

    // Redefine as listas filtradas
    this.filteredBrands = [...this.filterOptions.availableBrands];
    this.filteredCorredores = [...this.filterOptions.availableCorredores];
    this.filteredCategorias = [...this.filterOptions.availableCategorias];
    this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
    this.filteredLotes = [...this.filterOptions.availableLotes];
    this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];
  }

  /**
   * Emite o evento para fechar o modal
   */
  closeModal(): void {
    this.close.emit();
  }

  /**
   * Limpa um filtro específico.
   * Responsabilidade: Controle de estado dos filtros de apresentação (Component Layer).
   *
   * @param filterName Nome do filtro a ser limpo
   */
  clearFilter(filterName: keyof MuralFilter): void {
    // Tratamento específico para campos de data
    if (filterName === 'dataVencimento') {
      this.tempFilters.dataVencimento = { startDate: null, endDate: null };
      return;
    }

    if (filterName === 'dataFabricacao' || filterName === 'dataRecebimento') {
      this.tempFilters[filterName] = undefined;
      return;
    }

    // Tratamento para campos booleanos
    if (filterName === 'inspecionado') {
      this.tempFilters.inspecionado = undefined;
      return;
    }

    // Tratamento para arrays específicos
    if (filterName === 'motivoInspecao') {
      this.tempFilters.motivoInspecao = [];
      return;
    }

    if (filterName === 'usuarioInspecao') {
      this.tempFilters.usuarioInspecao = [];
      this.searchTerms.colaborador = '';
      this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];
      return;
    }

    // Tratamento para arrays de filtros de texto (marca, corredor, categoria, fornecedor, lote)
    if (filterName === 'marca' || filterName === 'corredor' || filterName === 'categoria' ||
        filterName === 'fornecedor' || filterName === 'lote') {

      // Limpar o array
      (this.tempFilters as any)[filterName] = [];

      // Limpar o campo de pesquisa correspondente e resetar lista filtrada
      switch (filterName) {
        case 'marca':
          this.searchTerms.marca = '';
          this.filteredBrands = [...this.filterOptions.availableBrands];
          break;
        case 'corredor':
          this.searchTerms.corredor = '';
          this.filteredCorredores = [...this.filterOptions.availableCorredores];
          break;
        case 'categoria':
          this.searchTerms.categoria = '';
          this.filteredCategorias = [...this.filterOptions.availableCategorias];
          break;
        case 'fornecedor':
          this.searchTerms.fornecedor = '';
          this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
          break;
        case 'lote':
          this.searchTerms.lote = '';
          this.filteredLotes = [...this.filterOptions.availableLotes];
          break;
      }
    }
  }

  /**
   * Verifica se há algum filtro temporário aplicado
   */
  hasTempFilters(): boolean {
    return (
      (this.tempFilters.marca && this.tempFilters.marca.length > 0) ||
      (this.tempFilters.corredor && this.tempFilters.corredor.length > 0) ||
      (this.tempFilters.categoria && this.tempFilters.categoria.length > 0) ||
      (this.tempFilters.fornecedor && this.tempFilters.fornecedor.length > 0) ||
      (this.tempFilters.lote && this.tempFilters.lote.length > 0) ||
      this.tempFilters.inspecionado !== undefined ||
      !!this.tempFilters.dataVencimento?.startDate ||
      !!this.tempFilters.dataVencimento?.endDate ||
      !!this.tempFilters.dataFabricacao?.startDate ||
      !!this.tempFilters.dataFabricacao?.endDate ||
      !!this.tempFilters.dataRecebimento?.startDate ||
      !!this.tempFilters.dataRecebimento?.endDate ||
      (this.tempFilters.motivoInspecao && this.tempFilters.motivoInspecao.length > 0) ||
      (this.tempFilters.usuarioInspecao && this.tempFilters.usuarioInspecao.length > 0)
    );
  }

  /**
   * Formata uma data para o formato esperado pelos inputs date (YYYY-MM-DD)
   */
  private formatDateForInput(date: Date): string {
    // Adiciona zeros à esquerda se necessário
    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  /**
   * Inicializa um campo de data com valores nulos
   */
  initializeDateField(): DateRange {
    return {
      startDate: null,
      endDate: null
    };
  }

  /**
   * Atualiza um campo de data específico nos filtros temporários.
   * Responsabilidade: Controle da lógica de apresentação de campos de data (Component Layer).
   * Garante que o valor da data seja armazenado exatamente como digitado pelo usuário.
   *
   * @param fieldName Nome do campo de data
   * @param type Tipo do campo (startDate ou endDate)
   * @param value Novo valor da data (formato yyyy-mm-dd do input date)
   */
  updateDateField(fieldName: 'dataVencimento' | 'dataFabricacao' | 'dataRecebimento', type: 'startDate' | 'endDate', value: string): void {
    // dataVencimento sempre existe
    if (fieldName === 'dataVencimento') {
      this.tempFilters.dataVencimento[type] = value || null;
      this.validateDateRange(fieldName);
      return;
    }

    // Para dataFabricacao e dataRecebimento - inicializa se não existir
    if (!this.tempFilters[fieldName]) {
      this.tempFilters[fieldName] = { startDate: null, endDate: null };
    }

    // Agora pode acessar com segurança
    this.tempFilters[fieldName]![type] = value || null;

    // Validar o intervalo de datas após a atualização
    this.validateDateRange(fieldName);
  }

  /**
   * Valida o intervalo de datas, garantindo que a data final não seja menor que a inicial.
   * Responsabilidade: Validação de dados de entrada no lado do cliente (Component Layer).
   *
   * @param fieldName Nome do campo de data a ser validado
   */
  validateDateRange(fieldName: 'dataVencimento' | 'dataFabricacao' | 'dataRecebimento'): void {
    // Para dataVencimento, sempre existe - validação direta
    if (fieldName === 'dataVencimento') {
      const dateRange = this.tempFilters.dataVencimento;
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        if (startDate > endDate) {
          dateRange.endDate = dateRange.startDate;
        }
      }
      return;
    }

    // Para dataFabricacao e dataRecebimento - podem ser undefined
    const dateRange = this.tempFilters[fieldName];

    // Se não existe, inicializa
    if (!dateRange) {
      this.tempFilters[fieldName] = this.initializeDateField();
      return;
    }

    // Se existe, valida o intervalo
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      if (startDate > endDate) {
        dateRange.endDate = dateRange.startDate;
      }
    }
  }

  // Adicionar métodos para abrir dropdowns de forma exclusiva
  openCorredorDropdown(): void {
    this.showCorredorDropdown = true;
    this.showMarcaDropdown = false;
    this.showCategoriaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
    this.showUsuarioInspecaoDropdown = false;
  }
  openMarcaDropdown(): void {
    this.showMarcaDropdown = true;
    this.showCorredorDropdown = false;
    this.showCategoriaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
    this.showUsuarioInspecaoDropdown = false;
  }
  openCategoriaDropdown(): void {
    this.showCategoriaDropdown = true;
    this.showCorredorDropdown = false;
    this.showMarcaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
    this.showUsuarioInspecaoDropdown = false;
  }
  openFornecedorDropdown(): void {
    this.showFornecedorDropdown = true;
    this.showCorredorDropdown = false;
    this.showMarcaDropdown = false;
    this.showCategoriaDropdown = false;
    this.showLoteDropdown = false;
    this.showUsuarioInspecaoDropdown = false;
  }
  openLoteDropdown(): void {
    this.showLoteDropdown = true;
    this.showCorredorDropdown = false;
    this.showMarcaDropdown = false;
    this.showCategoriaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showUsuarioInspecaoDropdown = false;
  }
  openUsuarioInspecaoDropdown(): void {
    this.showUsuarioInspecaoDropdown = true;
    this.showCorredorDropdown = false;
    this.showMarcaDropdown = false;
    this.showCategoriaDropdown = false;
    this.showFornecedorDropdown = false;
    this.showLoteDropdown = false;
  }
}

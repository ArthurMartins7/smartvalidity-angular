import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralFilter, MuralFilterOptions, MuralFilterService } from '../../../../shared/service/mural.service';

interface DateRange {
  startDate: string | null;
  endDate: string | null;
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

  // Estado temporário dos filtros que são aplicados apenas quando o usuário confirma
  tempFilters: MuralFilter = {
    marca: '',
    corredor: '',
    categoria: '',
    fornecedor: '',
    lote: '',
    dataVencimento: { startDate: null, endDate: null },
    inspecionado: undefined,
    motivoInspecao: '',
    usuarioInspecao: ''
  };

  // Filtros selecionados atualmente
  selectedFilters: MuralFilter = {
    marca: '',
    corredor: '',
    categoria: '',
    fornecedor: '',
    lote: '',
    dataVencimento: { startDate: null, endDate: null },
    inspecionado: undefined,
    motivoInspecao: '',
    usuarioInspecao: ''
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
  marcaSearchTerm: string = '';
  corredorSearchTerm: string = '';
  categoriaSearchTerm: string = '';
  fornecedorSearchTerm: string = '';
  loteSearchTerm: string = '';
  usuarioInspecaoSearchTerm: string = '';

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

  constructor(private filterService: MuralFilterService) {}

  ngOnInit(): void {
    // Carrega as opções de filtro ao inicializar o componente
    this.filterService.loadFilterOptions();

    // Inicializa os filtros temporários com os valores atuais
    this.tempFilters = { ...this.filterService.getCurrentFilters() };
    this.selectedFilters = { ...this.filterService.getCurrentFilters() };

    // Inicializa as datas para evitar problemas de formato
    if (this.tempFilters.dataVencimento.startDate) {
      this.tempFilters.dataVencimento.startDate = this.formatDateForInput(new Date(this.tempFilters.dataVencimento.startDate));
    }

    if (this.tempFilters.dataVencimento.endDate) {
      this.tempFilters.dataVencimento.endDate = this.formatDateForInput(new Date(this.tempFilters.dataVencimento.endDate));
    }

    // Assina para receber atualizações nas opções de filtro
    const optionsSub = this.filterService.filterOptions$.subscribe(options => {
      console.log('Opções de filtro atualizadas:', options);
      this.filterOptions = options;

      // Inicializa as listas filtradas com todos os valores
      this.filteredBrands = [...this.filterOptions.availableBrands];
      this.filteredCorredores = [...this.filterOptions.availableCorredores];
      this.filteredCategorias = [...this.filterOptions.availableCategorias];
      this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
      this.filteredLotes = [...this.filterOptions.availableLotes];
      this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];
      console.log('Lista de usuários disponíveis:', this.filteredUsuariosInspecao);

      // Inicializa os termos de pesquisa com os valores atuais selecionados
      this.marcaSearchTerm = this.tempFilters.marca;
      this.corredorSearchTerm = this.tempFilters.corredor;
      this.categoriaSearchTerm = this.tempFilters.categoria;
      this.fornecedorSearchTerm = this.tempFilters.fornecedor;
      this.loteSearchTerm = this.tempFilters.lote;
      this.usuarioInspecaoSearchTerm = this.tempFilters.usuarioInspecao;
    });

    this.subscriptions.push(optionsSub);
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
    const searchTerm = this.marcaSearchTerm.toLowerCase();
    this.tempFilters.marca = this.marcaSearchTerm;

    if (!searchTerm) {
      this.filteredBrands = [...this.filterOptions.availableBrands];
    } else {
      this.filteredBrands = this.filterOptions.availableBrands.filter(
        brand => brand.toLowerCase().includes(searchTerm)
      );
    }
  }

  onCorredorSearch(): void {
    const searchTerm = this.corredorSearchTerm.toLowerCase();
    this.tempFilters.corredor = this.corredorSearchTerm;

    if (!searchTerm) {
      this.filteredCorredores = [...this.filterOptions.availableCorredores];
    } else {
      this.filteredCorredores = this.filterOptions.availableCorredores.filter(
        corredor => corredor.toLowerCase().includes(searchTerm)
      );
    }
  }

  onCategoriaSearch(): void {
    const searchTerm = this.categoriaSearchTerm.toLowerCase();
    this.tempFilters.categoria = this.categoriaSearchTerm;

    if (!searchTerm) {
      this.filteredCategorias = [...this.filterOptions.availableCategorias];
    } else {
      this.filteredCategorias = this.filterOptions.availableCategorias.filter(
        categoria => categoria.toLowerCase().includes(searchTerm)
      );
    }
  }

  onFornecedorSearch(): void {
    const searchTerm = this.fornecedorSearchTerm.toLowerCase();
    this.tempFilters.fornecedor = this.fornecedorSearchTerm;

    if (!searchTerm) {
      this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
    } else {
      this.filteredFornecedores = this.filterOptions.availableFornecedores.filter(
        fornecedor => fornecedor.toLowerCase().includes(searchTerm)
      );
    }
  }

  onLoteSearch(): void {
    const searchTerm = this.loteSearchTerm.toLowerCase();
    this.tempFilters.lote = this.loteSearchTerm;

    if (!searchTerm) {
      this.filteredLotes = [...this.filterOptions.availableLotes];
    } else {
      this.filteredLotes = this.filterOptions.availableLotes.filter(
        lote => lote.toLowerCase().includes(searchTerm)
      );
    }
  }

  onUsuarioInspecaoSearch(): void {
    const searchTerm = this.usuarioInspecaoSearchTerm.toLowerCase();
    this.tempFilters.usuarioInspecao = this.usuarioInspecaoSearchTerm;

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
        this.tempFilters.marca = value;
        this.selectedFilters.marca = value;
        this.marcaSearchTerm = value;
        this.showMarcaDropdown = false;
        break;
      case 'corredor':
        this.tempFilters.corredor = value;
        this.selectedFilters.corredor = value;
        this.corredorSearchTerm = value;
        this.showCorredorDropdown = false;
        break;
      case 'categoria':
        this.tempFilters.categoria = value;
        this.selectedFilters.categoria = value;
        this.categoriaSearchTerm = value;
        this.showCategoriaDropdown = false;
        break;
      case 'fornecedor':
        this.tempFilters.fornecedor = value;
        this.selectedFilters.fornecedor = value;
        this.fornecedorSearchTerm = value;
        this.showFornecedorDropdown = false;
        break;
      case 'lote':
        this.tempFilters.lote = value;
        this.selectedFilters.lote = value;
        this.loteSearchTerm = value;
        this.showLoteDropdown = false;
        break;
      case 'usuarioInspecao':
        this.tempFilters.usuarioInspecao = value;
        this.selectedFilters.usuarioInspecao = value;
        this.usuarioInspecaoSearchTerm = value;
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
        case 'usuarioInspecao':
          this.showUsuarioInspecaoDropdown = false;
          break;
      }
    }, 200);
  }

  /**
   * Aplica os filtros e fecha o modal
   */
  applyFilters(): void {
    // Aplica todos os filtros
    this.filterService.updateFilters({
      ...this.tempFilters,
      // Não precisamos converter as datas, já que o serviço espera string
      dataVencimento: {
        startDate: this.tempFilters.dataVencimento.startDate,
        endDate: this.tempFilters.dataVencimento.endDate
      }
    });

    // Fecha o modal
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
    this.tempFilters = {
      marca: '',
      corredor: '',
      categoria: '',
      fornecedor: '',
      lote: '',
      dataVencimento: { startDate: null, endDate: null },
      inspecionado: undefined,
      motivoInspecao: '',
      usuarioInspecao: ''
    };

    // Limpa também os campos de pesquisa
    this.marcaSearchTerm = '';
    this.corredorSearchTerm = '';
    this.categoriaSearchTerm = '';
    this.fornecedorSearchTerm = '';
    this.loteSearchTerm = '';
    this.usuarioInspecaoSearchTerm = '';

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
   * Limpa um filtro específico
   */
  clearFilter(filterName: keyof MuralFilter): void {
    if (filterName === 'dataVencimento') {
      this.tempFilters.dataVencimento = { startDate: null, endDate: null };
    } else if (filterName === 'inspecionado') {
      this.tempFilters.inspecionado = undefined;
    } else if (filterName === 'motivoInspecao') {
      this.tempFilters.motivoInspecao = '';
    } else if (filterName === 'usuarioInspecao') {
      this.tempFilters.usuarioInspecao = '';
      this.usuarioInspecaoSearchTerm = '';
      this.filteredUsuariosInspecao = [...this.filterOptions.availableUsuariosInspecao];
    } else {
      // Usando type casting para contornar o problema de tipagem
      (this.tempFilters as any)[filterName] = '';

      // Também limpa o campo de pesquisa correspondente
      switch (filterName) {
        case 'marca':
          this.marcaSearchTerm = '';
          this.filteredBrands = [...this.filterOptions.availableBrands];
          break;
        case 'corredor':
          this.corredorSearchTerm = '';
          this.filteredCorredores = [...this.filterOptions.availableCorredores];
          break;
        case 'categoria':
          this.categoriaSearchTerm = '';
          this.filteredCategorias = [...this.filterOptions.availableCategorias];
          break;
        case 'fornecedor':
          this.fornecedorSearchTerm = '';
          this.filteredFornecedores = [...this.filterOptions.availableFornecedores];
          break;
        case 'lote':
          this.loteSearchTerm = '';
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
      !!this.tempFilters.marca ||
      !!this.tempFilters.corredor ||
      !!this.tempFilters.categoria ||
      !!this.tempFilters.fornecedor ||
      !!this.tempFilters.lote ||
      this.tempFilters.inspecionado !== undefined ||
      !!this.tempFilters.dataVencimento.startDate ||
      !!this.tempFilters.dataVencimento.endDate ||
      !!this.tempFilters.motivoInspecao ||
      !!this.tempFilters.usuarioInspecao
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
}

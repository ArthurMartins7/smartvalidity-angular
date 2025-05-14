import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule],
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
    inspecionado: null
  };

  // Opções disponíveis para os filtros
  filterOptions: MuralFilterOptions = {
    availableBrands: [],
    availableCorredores: [],
    availableCategorias: [],
    availableFornecedores: [],
    availableLotes: []
  };

  private subscriptions: Subscription[] = [];

  constructor(private filterService: MuralFilterService) {}

  ngOnInit(): void {
    // Inicializa os filtros temporários com os valores atuais
    this.tempFilters = { ...this.filterService.getCurrentFilters() };

    // Inicializa as datas para evitar problemas de formato
    if (this.tempFilters.dataVencimento.startDate) {
      this.tempFilters.dataVencimento.startDate = this.formatDateForInput(new Date(this.tempFilters.dataVencimento.startDate));
    }

    if (this.tempFilters.dataVencimento.endDate) {
      this.tempFilters.dataVencimento.endDate = this.formatDateForInput(new Date(this.tempFilters.dataVencimento.endDate));
    }

    // Assina para receber atualizações nas opções de filtro
    const optionsSub = this.filterService.filterOptions$.subscribe(options => {
      this.filterOptions = options;
    });

    this.subscriptions.push(optionsSub);
  }

  ngOnDestroy(): void {
    // Desinscreve de todas as assinaturas para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
      inspecionado: null
    };
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
      this.tempFilters.inspecionado = null;
    } else {
      // Usando type casting para contornar o problema de tipagem
      (this.tempFilters as any)[filterName] = '';
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
      this.tempFilters.inspecionado !== null ||
      !!this.tempFilters.dataVencimento.startDate ||
      !!this.tempFilters.dataVencimento.endDate
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

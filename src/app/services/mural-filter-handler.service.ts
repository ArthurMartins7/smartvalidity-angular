import { Injectable } from '@angular/core';
import { MuralItem } from '../models/mural.model';
import { MuralFilter, MuralFilterService } from './mural-filter.service';

interface DateFilter {
  startDate: string | null;
  endDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MuralFilterHandlerService {
  constructor(private filterService: MuralFilterService) {}

  /**
   * Aplica todos os filtros (básicos e avançados) aos itens
   */
  applyAllFilters(items: MuralItem[], searchTerm: string): MuralItem[] {
    let filteredItems = [...items];

    // Filtro de busca textual básica (sobre todos os campos)
    if (searchTerm) {
      filteredItems = this.applyBasicSearch(filteredItems, searchTerm);
    }

    // Filtros avançados
    filteredItems = this.applyAdvancedFilters(filteredItems);

    return filteredItems;
  }

  /**
   * Aplica o filtro de busca básico em múltiplos campos
   */
  private applyBasicSearch(items: MuralItem[], term: string): MuralItem[] {
    const searchTermLower = term.toLowerCase();
    return items.filter(item => {
      // Busca em várias propriedades do item
      return (
        // Nome do produto
        (item.produto?.nome?.toLowerCase().includes(searchTermLower)) ||
        // Código de barras
        (item.produto?.codigoBarras?.toLowerCase().includes(searchTermLower)) ||
        // Marca
        (item.produto?.marca?.toLowerCase().includes(searchTermLower)) ||
        // Lote
        (item.lote?.toLowerCase().includes(searchTermLower))
      );
    });
  }

  /**
   * Aplica os filtros avançados
   */
  private applyAdvancedFilters(items: MuralItem[]): MuralItem[] {
    const filters = this.filterService.getCurrentFilters();
    let filtered = [...items];

    // Filtros de texto
    filtered = this.applyTextFilters(filtered, filters);

    // Filtros de data
    filtered = this.applyDateFilters(filtered, filters);

    // Filtro de status de inspeção
    filtered = this.applyInspecaoFilter(filtered, filters);

    return filtered;
  }

  /**
   * Aplica filtros de texto (marca, corredor, categoria, fornecedor, lote)
   */
  private applyTextFilters(items: MuralItem[], filters: MuralFilter): MuralItem[] {
    return items.filter(item => {
      // Se o filtro estiver vazio, retorna true (não filtra)
      const matchMarca = !filters.marca || (item.produto?.marca === filters.marca);
      const matchCorredor = !filters.corredor || (item.corredor === filters.corredor);
      const matchCategoria = !filters.categoria || (item.categoria === filters.categoria);
      const matchFornecedor = !filters.fornecedor || (item.fornecedor === filters.fornecedor);
      const matchLote = !filters.lote || (item.lote === filters.lote);

      // Todos os filtros devem dar match (AND lógico)
      return matchMarca && matchCorredor && matchCategoria && matchFornecedor && matchLote;
    });
  }

  /**
   * Aplica filtros de data (data de vencimento, data de fabricação, data de recebimento)
   */
  private applyDateFilters(items: MuralItem[], filters: MuralFilter): MuralItem[] {
    // Processa datas de vencimento
    if (filters.dataVencimento.startDate || filters.dataVencimento.endDate) {
      items = this.filterByDateRange(
        items,
        filters.dataVencimento.startDate ? new Date(filters.dataVencimento.startDate) : null,
        filters.dataVencimento.endDate ? new Date(filters.dataVencimento.endDate) : null,
        'dataValidade'
      );
    }

    return items;
  }

  /**
   * Aplica filtro por status de inspeção
   */
  private applyInspecaoFilter(items: MuralItem[], filters: MuralFilter): MuralItem[] {
    // Se o filtro de inspeção não estiver definido, retorna todos os itens
    if (filters.inspecionado === null) {
      return items;
    }

    // Filtra por status de inspeção
    return items.filter(item => item.inspecionado === filters.inspecionado);
  }

  /**
   * Filtra itens por intervalo de datas
   */
  private filterByDateRange(items: MuralItem[], startDate: Date | null, endDate: Date | null, dateField: string): MuralItem[] {
    return items.filter(item => {
      const itemDate = new Date(item[dateField as keyof MuralItem] as string);

      // Verifica se a data está dentro do intervalo
      const afterStart = !startDate || itemDate >= startDate;
      const beforeEnd = !endDate || itemDate <= endDate;

      return afterStart && beforeEnd;
    });
  }

  /**
   * Ordena os itens por nome do produto
   */
  sortItems(items: MuralItem[], direction: 'asc' | 'desc'): MuralItem[] {
    return [...items].sort((a, b) => {
      const nameA = a.produto?.nome?.toLowerCase() || '';
      const nameB = b.produto?.nome?.toLowerCase() || '';

      if (direction === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  }
}

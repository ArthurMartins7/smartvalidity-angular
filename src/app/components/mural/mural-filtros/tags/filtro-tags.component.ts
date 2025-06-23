import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MuralFilter, MuralFilterService } from '../../../../shared/service/mural.service';

/**
 * Component responsável pela exibição e gerenciamento de tags de filtros aplicados.
 *
 * Responsabilidades MVC (Angular):
 * - View: Renderizar tags visuais dos filtros ativos
 * - Controller: Gerenciar eventos de remoção e limpeza de filtros
 * - Comunicação: Emitir eventos para componentes pai via Observer Pattern
 *
 * Arquitetura: Este componente atua como uma "view" no padrão MVC,
 * delegando toda lógica de negócio para o MuralFilterService e
 * comunicando-se com componentes pai apenas via eventos.
 *
 * Não contém lógica de negócio (delegada para MuralFilterService)
 */
@Component({
  selector: 'app-filtro-tags',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filtro-tags.component.html',
  styleUrls: ['./filtro-tags.component.css']
})
export class FiltroTagsComponent {
  /**
   * Eventos para comunicação com componente pai.
   * Padrão: Observer Pattern para comunicação hierárquica entre componentes.
   * Responsabilidade: Interface de comunicação (não lógica de negócio).
   */
  @Output() clearFilter = new EventEmitter<string>();
  @Output() clearDateFilter = new EventEmitter<void>();
  @Output() clearSpecificDateFilter = new EventEmitter<string>();
  @Output() resetAllFilters = new EventEmitter<void>();
  @Output() removeFilterValue = new EventEmitter<{filterName: string, value: string}>();

  /**
   * Injeção do serviço de filtros.
   * Responsabilidade: Acesso aos dados de estado (read-only para apresentação).
   */
  constructor(public filterService: MuralFilterService) {}

  /**
   * Manipulador de evento para limpeza de filtro específico.
   * Responsabilidade MVC: Controller - captura evento de interface e propaga.
   *
   * @param filterName Nome do filtro a ser limpo
   */
  onClearFilter(filterName: keyof MuralFilter): void {
    this.clearFilter.emit(filterName as string);
  }

  /**
   * Manipulador de evento para limpeza de filtros de data (método legado).
   * Responsabilidade MVC: Controller - captura evento de interface e propaga.
   */
  onClearDateFilter(): void {
    this.clearDateFilter.emit();
  }

  /**
   * Manipulador de evento para limpeza de filtro de data específico.
   * Responsabilidade MVC: Controller - captura evento de interface e propaga.
   *
   * @param dateType Tipo do filtro de data ('dataVencimento', 'dataFabricacao', 'dataRecebimento')
   */
  onClearSpecificDateFilter(dateType: string): void {
    this.clearSpecificDateFilter.emit(dateType);
  }

  /**
   * Manipulador de evento para reset completo dos filtros.
   * Responsabilidade MVC: Controller - captura evento de interface e propaga.
   */
  onResetAllFilters(): void {
    this.resetAllFilters.emit();
  }

  /**
   * Manipulador de evento para remoção de valor específico de filtro.
   * Responsabilidade MVC: Controller - captura evento de interface e propaga.
   *
   * @param filterName Nome do filtro
   * @param value Valor a ser removido
   */
  onRemoveFilterValue(filterName: string, value: string): void {
    this.removeFilterValue.emit({filterName, value});
  }

  /**
   * Verifica se há filtros aplicados para exibição condicional.
   * Responsabilidade MVC: View Helper - delega verificação ao service.
   *
   * @returns True se há filtros aplicados
   */
  hasAppliedFilters(): boolean {
    return this.filterService.hasAppliedFilters();
  }

  /**
   * Obtém filtros de data aplicados para exibição.
   * Responsabilidade MVC: View Helper - delega obtenção de dados ao service.
   *
   * @returns Array com informações dos filtros de data aplicados
   */
  getAppliedDateFilters() {
    return this.filterService.getAppliedDateFilters();
  }
}

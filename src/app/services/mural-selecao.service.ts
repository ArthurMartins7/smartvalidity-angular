import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MuralItem } from '../models/mural.model';
import { MuralService } from './mural.service';

@Injectable({
  providedIn: 'root'
})
export class MuralSelecaoService {
  private selectedItemsSubject = new BehaviorSubject<string[]>([]);
  private showInspecaoModalSubject = new BehaviorSubject<boolean>(false);
  private motivoInspecaoSubject = new BehaviorSubject<string>('');
  private motivoInspecaoErrorSubject = new BehaviorSubject<string | null>(null);

  // Opções de motivos de inspeção
  readonly motivosInspecao: string[] = ['Avaria/Quebra', 'Promoção'];

  // Observables públicos
  selectedItems$: Observable<string[]> = this.selectedItemsSubject.asObservable();
  showInspecaoModal$: Observable<boolean> = this.showInspecaoModalSubject.asObservable();
  motivoInspecao$: Observable<string> = this.motivoInspecaoSubject.asObservable();
  motivoInspecaoError$: Observable<string | null> = this.motivoInspecaoErrorSubject.asObservable();

  constructor(private muralService: MuralService) { }

  // Atualiza os itens selecionados
  updateSelectedItems(items: string[]): void {
    this.selectedItemsSubject.next(items);
  }

  // Seleciona ou desmarca todos os itens
  selectAll(items: MuralItem[], selected: boolean): void {
    const ids = selected ?
      items.map(item => item.id) :
      [];
    this.selectedItemsSubject.next(ids);
  }

  // Alterna a seleção de um item
  toggleItemSelection(item: MuralItem, selected: boolean): void {
    const currentItems = [...this.selectedItemsSubject.value];

    if (selected && !currentItems.includes(item.id)) {
      currentItems.push(item.id);
    } else if (!selected) {
      const index = currentItems.indexOf(item.id);
      if (index > -1) {
        currentItems.splice(index, 1);
      }
    }

    this.selectedItemsSubject.next(currentItems);
  }

  // Verifica se há itens selecionados
  hasSelectedItems(): boolean {
    return this.selectedItemsSubject.value.length > 0;
  }

  // Retorna o número de itens selecionados
  getSelectedItemsCount(): number {
    return this.selectedItemsSubject.value.length;
  }

  // Retorna os itens selecionados a partir de uma lista de todos os itens
  getSelectedItems(allItems: MuralItem[] = []): MuralItem[] {
    const selectedIds = this.getSelectedIds();
    if (allItems && allItems.length > 0) {
      return allItems.filter(item => selectedIds.includes(item.id));
    }
    return [];
  }

  // Controle do modal de inspeção
  openInspecaoModal(): void {
    if (!this.hasSelectedItems()) return;

    this.motivoInspecaoSubject.next('');
    this.motivoInspecaoErrorSubject.next(null);
    this.showInspecaoModalSubject.next(true);
  }

  closeInspecaoModal(): void {
    this.showInspecaoModalSubject.next(false);
    this.motivoInspecaoSubject.next('');
    this.motivoInspecaoErrorSubject.next(null);
  }

  selecionarMotivo(motivo: string): void {
    this.motivoInspecaoSubject.next(motivo);
    this.motivoInspecaoErrorSubject.next(null);
  }

  // Confirma a inspeção para os itens selecionados
  confirmarInspecao(items: MuralItem[]): Observable<MuralItem[]> {
    const motivoInspecao = this.motivoInspecaoSubject.value;
    const selectedIds = this.selectedItemsSubject.value;

    if (!motivoInspecao) {
      this.motivoInspecaoErrorSubject.next('Por favor, selecione um motivo para a inspeção.');
      throw new Error('Motivo de inspeção não selecionado');
    }

    return this.muralService.marcarVariosInspecionados(selectedIds, motivoInspecao);
  }

  // Limpa a seleção
  clearSelection(): void {
    this.selectedItemsSubject.next([]);
  }

  // Obtém os IDs dos itens selecionados
  getSelectedIds(): string[] {
    return this.selectedItemsSubject.value;
  }
}

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MuralItem } from '../../../models/mural.model';
import { MuralService } from '../../../services/mural.service';

@Component({
  selector: 'app-mural-listagem',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './mural-listagem.component.html',
  styleUrl: './mural-listagem.component.css'
})
export class MuralListagemComponent implements OnInit {
  items: MuralItem[] = [];
  filteredItems: MuralItem[] = [];
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';
  searchTerm: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private muralService: MuralService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    switch (this.activeTab) {
      case 'proximo':
        this.muralService.getProximosVencer().subscribe({
          next: (items) => {
            this.items = items;
            this.applyFilter();
          },
          error: (error) => console.error('Erro ao carregar próximos a vencer:', error)
        });
        break;
      case 'hoje':
        this.muralService.getVencemHoje().subscribe({
          next: (items) => {
            this.items = items;
            this.applyFilter();
          },
          error: (error) => console.error('Erro ao carregar vencem hoje:', error)
        });
        break;
      case 'vencido':
        this.muralService.getVencidos().subscribe({
          next: (items) => {
            this.items = items;
            this.applyFilter();
          },
          error: (error) => console.error('Erro ao carregar vencidos:', error)
        });
        break;
    }
  }

  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido') {
    this.activeTab = tab;
    this.loadItems();
  }

  // Função para aplicar filtro de pesquisa
  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.items];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.filteredItems = this.items.filter(item =>
        item.produto?.descricao?.toLowerCase().includes(searchTermLower) ||
        item.produto?.codigoBarras?.toLowerCase().includes(searchTermLower) ||
        item.produto?.marca?.toLowerCase().includes(searchTermLower)
      );
    }
    this.sortItems();
  }

  // Função para alternar a direção da ordenação
  toggleSortOrder() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortItems();
  }

  // Função para ordenar os itens
  sortItems() {
    this.filteredItems.sort((a, b) => {
      const descA = a.produto?.descricao?.toLowerCase() || '';
      const descB = b.produto?.descricao?.toLowerCase() || '';

      if (this.sortDirection === 'asc') {
        return descA.localeCompare(descB);
      } else {
        return descB.localeCompare(descA);
      }
    });
  }

  // Função para marcar ou desmarcar um item como inspecionado
  toggleInspecionado(item: MuralItem) {
    this.muralService.marcarInspecionado(item.id).subscribe({
      next: (updatedItem) => {
        // Atualizar o estado do item na lista
        const index = this.items.findIndex(i => i.id === updatedItem.id);
        if (index !== -1) {
          this.items[index].inspecionado = updatedItem.inspecionado;
        }
        // Também atualizar na lista filtrada
        const filteredIndex = this.filteredItems.findIndex(i => i.id === updatedItem.id);
        if (filteredIndex !== -1) {
          this.filteredItems[filteredIndex].inspecionado = updatedItem.inspecionado;
        }
      },
      error: (error) => console.error('Erro ao marcar item como inspecionado:', error)
    });
  }

  // Função para selecionar/desselecionar todos os itens
  selectAll(event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    this.filteredItems.forEach(item => {
      item.selecionado = checked;
    });
  }
}

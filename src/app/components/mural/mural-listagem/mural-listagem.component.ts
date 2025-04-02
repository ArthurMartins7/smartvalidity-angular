import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MuralItem } from '../../../models/mural.model';
import { MuralService } from '../../../services/mural.service';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';

@Component({
  selector: 'app-mural-listagem',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mural-listagem.component.html',
  styleUrl: './mural-listagem.component.css'
})
export class MuralListagemComponent implements OnInit {
  items: MuralItem[] = [];
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo';

  constructor(private muralService: MuralService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    switch (this.activeTab) {
      case 'proximo':
        this.muralService.getProximosVencer().subscribe({
          next: (items) => this.items = items,
          error: (error) => console.error('Erro ao carregar próximos a vencer:', error)
        });
        break;
      case 'hoje':
        this.muralService.getVencemHoje().subscribe({
          next: (items) => this.items = items,
          error: (error) => console.error('Erro ao carregar vencem hoje:', error)
        });
        break;
      case 'vencido':
        this.muralService.getVencidos().subscribe({
          next: (items) => this.items = items,
          error: (error) => console.error('Erro ao carregar vencidos:', error)
        });
        break;
    }
  }

  setActiveTab(tab: 'proximo' | 'hoje' | 'vencido') {
    this.activeTab = tab;
    this.loadItems();
  }
}

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MuralItem } from '../../../models/mural.model';
import { MuralService } from '../../../services/mural.service';

@Component({
  selector: 'app-mural-detalhe',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './mural-detalhe.component.html',
  styleUrl: './mural-detalhe.component.css'
})
export class MuralDetalheComponent implements OnInit {
  itemId: string = '';
  item: MuralItem | null = null;
  loading: boolean = true;
  error: string | null = null;
  activeTab: 'proximo' | 'hoje' | 'vencido' = 'proximo'; // Aba ativa padrão

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private muralService: MuralService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.itemId = params['id'];

      // Captura a aba de onde o usuário veio
      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['tab']) {
          this.activeTab = queryParams['tab'] as 'proximo' | 'hoje' | 'vencido';
        }
      });

      this.loadItemDetails();
    });
  }

  loadItemDetails(): void {
    this.loading = true;
    this.error = null;

    this.muralService.getItemById(this.itemId).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do item:', err);
        this.error = 'Ocorreu um erro ao carregar os detalhes do item. Por favor, tente novamente mais tarde.';
        this.loading = false;
      }
    });
  }

  marcarInspecionado(): void {
    if (!this.item) return;

    this.muralService.marcarInspecionado(this.itemId).subscribe({
      next: () => {
        // Redireciona para a mesma aba de onde o usuário veio
        this.router.navigate(['/mural-listagem'], {
          queryParams: { tab: this.activeTab },
          state: { activeTab: this.activeTab }
        });
      },
      error: (err) => {
        console.error('Erro ao marcar item como inspecionado:', err);
        this.error = 'Ocorreu um erro ao marcar o item como inspecionado. Por favor, tente novamente mais tarde.';
      }
    });
  }
}

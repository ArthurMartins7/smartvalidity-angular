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
  activeTab: string = 'proximo';
  motivoInspecao: string = '';
  showMotivosDropdown: boolean = false;
  motivosInspecao: string[] = ['Avaria/Quebra', 'Promoção'];
  motivoError: string | null = null;

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
          this.activeTab = queryParams['tab'];
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

    // Limpa erros anteriores
    this.motivoError = null;

    // Validação específica para o motivo da inspeção
    if (!this.motivoInspecao) {
      this.motivoError = 'Por favor, selecione um motivo para a inspeção.';
      return;
    }

    this.muralService.marcarInspecionado(this.itemId, this.motivoInspecao).subscribe({
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

  toggleMotivosDropdown(): void {
    this.showMotivosDropdown = !this.showMotivosDropdown;
    // Limpa o erro de motivo quando o dropdown é aberto/fechado
    if (this.motivoError) {
      this.motivoError = null;
    }
  }

  selecionarMotivo(motivo: string): void {
    this.motivoInspecao = motivo;
    this.showMotivosDropdown = false;
    // Limpa o erro de motivo quando um motivo é selecionado
    this.motivoError = null;
  }
}

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MuralListagemDTO } from '../../../shared/model/dto/mural.dto';
import { MuralService, MuralSelecaoService } from '../../../shared/service/mural.service';
import { ModalInspecaoComponent } from '../mural-modal-inspecao/modal-inspecao.component';

@Component({
  selector: 'app-mural-detalhe',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, ModalInspecaoComponent],
  templateUrl: './mural-detalhe.component.html',
  styleUrl: './mural-detalhe.component.css'
})
export class MuralDetalheComponent implements OnInit {
  itemId: string = '';
  item: MuralListagemDTO | null = null;
  loading: boolean = true;
  error: string | null = null;
  activeTab: string = 'proximo';
  processandoInspecao: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private muralService: MuralService,
    private selecaoService: MuralSelecaoService
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

  abrirModalInspecao(): void {
    if (!this.item) return;
    
    // Limpa seleções anteriores
    this.selecaoService.updateSelectedItems([this.itemId]);
    
    // Abre o modal
    this.selecaoService.openInspecaoModal();
  }

  onInspecaoConfirmada(): void {
    if (!this.item) return;

    // Já está processando, não permitir cliques duplicados
    if (this.processandoInspecao) return;

    // Atualiza o status para processando
    this.processandoInspecao = true;

    // Obtém o motivo e motivo customizado do serviço
    this.selecaoService.confirmarInspecao([this.item]).subscribe({
      next: (itens) => {
        if (itens && itens.length > 0) {
          this.item = itens[0];
        }

        // Adiciona um pequeno atraso para permitir que o usuário veja a mudança
        setTimeout(() => {
          // Redireciona para a mesma aba de onde o usuário veio, preservando o estado dos filtros
          this.router.navigate(['/mural-listagem'], {
            queryParams: { tab: this.activeTab },
            state: {
              activeTab: this.activeTab,
              preserveFilters: true // Indica que os filtros devem ser mantidos
            }
          });
        }, 1000);
      },
      error: (err) => {
        console.error('Erro ao marcar item como inspecionado:', err);
        // Extrai a mensagem de erro da resposta se possível
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Ocorreu um erro ao marcar o item como inspecionado. Por favor, tente novamente mais tarde.';
        }
        this.processandoInspecao = false;
      }
    });
  }

  voltar(): void {
    // Sempre navega de volta para a listagem preservando os filtros
    this.router.navigate(['/mural-listagem'], {
      queryParams: { tab: this.activeTab },
      state: {
        activeTab: this.activeTab,
        preserveFilters: true // Sempre preserva os filtros
      }
    });
  }
}

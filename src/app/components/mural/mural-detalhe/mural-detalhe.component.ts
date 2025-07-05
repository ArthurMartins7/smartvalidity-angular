import { CommonModule, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MuralListagemDTO } from '../../../shared/model/dto/mural.dto';
import { MuralSelecaoService, MuralService } from '../../../shared/service/mural.service';
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
    private selecaoService: MuralSelecaoService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.itemId = params['id'];
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
    this.selecaoService.updateSelectedItems([this.itemId]);
    this.selecaoService.openInspecaoModal();
  }

  onInspecaoConfirmada(): void {
    if (!this.item) return;
    if (this.processandoInspecao) return;
    this.processandoInspecao = true;
    this.selecaoService.confirmarInspecao([this.item]).subscribe({
      next: (itens) => {
        if (itens && itens.length > 0) {
          this.item = itens[0];
        }
        setTimeout(() => {
          this.router.navigate(['/mural-listagem'], {
            queryParams: { tab: this.activeTab },
            state: {
              activeTab: this.activeTab,
              preserveFilters: true
            }
          });
        }, 1000);
      },
      error: (err) => {
        console.error('Erro ao marcar item como inspecionado:', err);
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
    this.location.back();
  }
}

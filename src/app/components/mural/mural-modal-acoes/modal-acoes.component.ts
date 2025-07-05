import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MuralListagemDTO } from '../../../shared/model/dto/mural.dto';
import { MuralSelecaoService } from '../../../shared/service/mural.service';

type AcaoTipo = 'relatorio-selecionados' | 'relatorio-pagina' | 'relatorio-todos' | 'inspecao';

@Component({
  selector: 'app-modal-acoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-acoes.component.html',
  styleUrls: ['./modal-acoes.component.css']
})
export class ModalAcoesComponent implements OnInit, OnDestroy {
  @Output() acaoSelecionada = new EventEmitter<AcaoTipo>();
  @Input() itensPaginaAtual: MuralListagemDTO[] = [];
  @Input() totalItensAba: number = 0;
  @Input() nomeAba: string = '';
  @Input() numeroPaginaAtual: number = 1;

  // Propriedades para controle do modal
  visible = false;
  itensSelecionadosCount = 0;
  itensPaginaCount = 0;
  temItensInspecionados = false;
  mensagemInspecao = '';
  selecoesMisturadas = false;
  mensagemSelecaoMisturada = '';
  itensSelecionados: MuralListagemDTO[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private selecaoService: MuralSelecaoService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.selecaoService.showAcoesModal$.subscribe(
        show => {
          this.visible = show;
          if (show) {
            this.atualizarContadores();
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private atualizarContadores(): void {
    this.selecaoService.getSelectedItems().subscribe(items => {
      this.itensSelecionados = items;
      this.itensSelecionadosCount = items.length;
      const itensInspecionados = items.filter(item => item.inspecionado);
      this.temItensInspecionados = itensInspecionados.length > 0;
      if (this.temItensInspecionados) {
        this.mensagemInspecao = `Existem ${itensInspecionados.length} produtos já inspecionados no grupo que você selecionou. Desmarque estes produtos já inspecionados e tente inspecionar os outros produtos novamente:`;
      } else {
        this.mensagemInspecao = '';
      }
      this.selecoesMisturadas = false;
      this.mensagemSelecaoMisturada = '';
      if (items.length > 0) {
        const statusSet = new Set(items.map(item => item.status));
        if (statusSet.size > 1) {
          this.selecoesMisturadas = true;
          this.mensagemSelecaoMisturada = 'Existem produtos selecionados de abas diferentes. As opções "Produtos da página atual" e "Todos os produtos da aba" só podem ser usadas quando todos os produtos selecionados pertencem à mesma aba.';
        }
      }
    });
    this.itensPaginaCount = this.itensPaginaAtual.length;
  }

  selecionarAcao(acao: AcaoTipo): void {
    if (acao === 'inspecao' && this.temItensInspecionados) {
      return;
    }

    this.acaoSelecionada.emit(acao);
    this.closeModal();
  }

  closeModal(): void {
    this.selecaoService.closeAcoesModal();
  }

  desmarcarInspecionadosSelecionados(): void {
    this.selecaoService.getSelectedItems().subscribe(items => {
      this.selecaoService.desmarcarInspecionados(items);
      this.atualizarContadores();
    });
  }

  desmarcarOutrasPaginasAbas(): void {
    this.selecaoService.getSelectedItems().subscribe(items => {
      const idsPaginaAtual = this.itensPaginaAtual.map(item => item.id);
      const idsParaManter = items.filter(item => idsPaginaAtual.includes(item.id)).map(item => item.id);
      this.selecaoService.updateSelectedItems(idsParaManter);
      this.atualizarContadores();
    });
  }

  get selecionadosNaAbaAtual(): number {
    let statusAtual = '';
    if (this.nomeAba === 'Próximos a vencer') statusAtual = 'proximo';
    else if (this.nomeAba === 'Vencem hoje') statusAtual = 'hoje';
    else if (this.nomeAba === 'Vencidos') statusAtual = 'vencido';
    return this.itensSelecionados.filter(item => item.status === statusAtual).length;
  }

  get selecionadosOutrasAbas(): number {
    let statusAtual = '';
    if (this.nomeAba === 'Próximos a vencer') statusAtual = 'proximo';
    else if (this.nomeAba === 'Vencem hoje') statusAtual = 'hoje';
    else if (this.nomeAba === 'Vencidos') statusAtual = 'vencido';
    return this.itensSelecionados.filter(item => item.status !== statusAtual).length;
  }
}

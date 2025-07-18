import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService } from '../../shared/service/produto.service';
import { Produto } from '../../shared/model/entity/produto';
import { ItemProdutoService } from '../../shared/service/item-produto.service';
import { ItemProdutoDTO } from '../../shared/model/dto/item-Produto.dto';
import { CategoriaDTO } from '../../shared/model/dto/categoria.dto';
import { ProdutoDTO } from '../../shared/model/dto/produto.dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-entrada-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada-estoque.component.html',
  styleUrl: './entrada-estoque.component.css'
})
export class EntradaEstoqueComponent implements OnInit {
  formData = {
    produto: '',
    lote: '',
    precoVenda: null as number | null,
    quantidade: 1,
    dataRecebimento: '',
    horaRecebimento: '',
    dataFabricacao: '',
    horaFabricacao: '',
    dataVencimento: '',
    horaVencimento: ''
  };

  produtos: Produto[] = [];
  produtoSelecionado: Produto | null = null;

  // Controle de busca/autocomplete de produto
  searchTermProduto: string = '';
  filteredProdutos: Produto[] = [];
  showProdutoDropdown: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produtoService: ProdutoService,
    private itemProdutoService: ItemProdutoService
  ) {}

  ngOnInit() {
    // Carregar lista de produtos
    this.carregarProdutos();

    // Verificar se há um produtoId nos parâmetros da rota
    this.route.queryParams.subscribe(params => {
      if (params['produtoId']) {
        this.produtoService.buscarPorId(params['produtoId']).subscribe({
          next: (produto) => {
            this.produtoSelecionado = produto;
            this.formData.produto = produto.id;
            // Preenche campo de busca para exibir produto selecionado
            this.searchTermProduto = `${produto.descricao} (${produto.codigoBarras})`;
          },
          error: (erro) => {
            console.error('Erro ao carregar produto:', erro);
            Swal.fire('Erro', 'Não foi possível carregar o produto selecionado', 'error');
          }
        });
      }
    });
  }

  carregarProdutos() {
    this.produtoService.listarTodos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        // Inicializa lista filtrada com todos os produtos
        this.filteredProdutos = [...this.produtos];
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
        Swal.fire('Erro', 'Não foi possível carregar a lista de produtos', 'error');
      }
    });
  }

  onSubmit() {
    console.log('Form Data:', this.formData);

    const camposVazios = [];
    if (!this.formData.produto) camposVazios.push('Produto');
    if (!this.formData.lote) camposVazios.push('Lote');
    if (this.formData.precoVenda === null) camposVazios.push('Preço de Venda');
    if (!this.formData.dataRecebimento) camposVazios.push('Data de Recebimento');
    if (!this.formData.dataFabricacao) camposVazios.push('Data de Fabricação');
    if (!this.formData.dataVencimento) camposVazios.push('Data de Vencimento');

    if (camposVazios.length > 0) {
      console.log('Campos vazios:', camposVazios);
      Swal.fire('Atenção', `Preencha os seguintes campos obrigatórios: ${camposVazios.join(', ')}`, 'warning');
      return;
    }

    // Encontrar o produto selecionado
    const produtoSelecionado = this.produtos.find(p => p.id === this.formData.produto);
    if (!produtoSelecionado) {
      Swal.fire('Erro', 'Produto não encontrado', 'error');
      return;
    }

    // Formatar as datas para o formato ISO
    const formatarData = (data: string, hora: string) => {
      const [ano, mes, dia] = data.split('-');
      return `${ano}-${mes}-${dia}T${hora}:00`;
    };

    const itemProduto: ItemProdutoDTO = {
      lote: this.formData.lote,
      precoVenda: Number(this.formData.precoVenda),
      dataFabricacao: formatarData(this.formData.dataFabricacao, this.formData.horaFabricacao),
      dataVencimento: formatarData(this.formData.dataVencimento, this.formData.horaVencimento),
      dataRecebimento: formatarData(this.formData.dataRecebimento, this.formData.horaRecebimento),
      produto: {
        id: produtoSelecionado.id,
        codigoBarras: produtoSelecionado.codigoBarras,
        descricao: produtoSelecionado.descricao,
        marca: produtoSelecionado.marca,
        unidadeMedida: produtoSelecionado.unidadeMedida,
        quantidade: produtoSelecionado.quantidade,
        categoria: {
          id: Number(produtoSelecionado.categoria.id),
          nome: produtoSelecionado.categoria.nome,
          produtos: []
        }
      },
      quantidade: this.formData.quantidade
    };

    console.log('ItemProduto a ser enviado:', JSON.stringify(itemProduto, null, 2));

    this.itemProdutoService.criarItemProduto(itemProduto).subscribe({
      next: (response) => {
        Swal.fire('Sucesso', 'Entrada de estoque registrada com sucesso', 'success');
        // Limpar formulário ou redirecionar
        this.formData = {
          produto: '',
          lote: '',
          precoVenda: null,
          quantidade: 1,
          dataRecebimento: '',
          horaRecebimento: '',
          dataFabricacao: '',
          horaFabricacao: '',
          dataVencimento: '',
          horaVencimento: ''
        };
        this.produtoSelecionado = null;
        this.router.navigate(['/mural-listagem']);
      },
      error: (erro) => {
        console.error('Erro completo:', erro);
        console.error('Detalhes do erro:', {
          status: erro.status,
          message: erro.error?.message,
          error: erro.error,
          headers: erro.headers,
          url: erro.url
        });

        let mensagemErro = 'Não foi possível registrar a entrada de estoque';
        if (erro.error?.message) {
          mensagemErro = erro.error.message;
        } else if (erro.error?.error) {
          mensagemErro = erro.error.error;
        }
        Swal.fire('Erro', mensagemErro, 'error');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/mural-listagem']);
  }

  /**
   * Filtra produtos de acordo com o termo digitado.
   */
  onProdutoSearch(): void {
    const term = this.searchTermProduto.toLowerCase();

    if (!term) {
      this.filteredProdutos = [...this.produtos];
    } else {
      this.filteredProdutos = this.produtos.filter(p => {
        return p.descricao.toLowerCase().includes(term) ||
               (p.marca && p.marca.toLowerCase().includes(term)) ||
               (p.codigoBarras && p.codigoBarras.toLowerCase().includes(term));
      });
    }
  }

  /** Exibe dropdown de produtos. */
  openProdutoDropdown(): void {
    this.showProdutoDropdown = true;
  }

  /** Seleciona um produto da lista */
  selectProduto(produto: Produto): void {
    this.produtoSelecionado = produto;
    this.formData.produto = produto.id;
    this.searchTermProduto = `${produto.descricao} (${produto.codigoBarras})`;
    this.showProdutoDropdown = false;
  }

  /** Fecha dropdown quando clicar fora */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.produto-dropdown-container')) {
      this.showProdutoDropdown = false;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProdutoService } from '../../../shared/service/produto.service';
import { Produto } from '../../../shared/model/entity/produto';
import { ItemProdutoService } from '../../../shared/service/item-produto.service';
import { ItemProdutoDTO } from '../../../shared/model/dto/item-Produto.dto';
import { CategoriaDTO } from '../../../shared/model/dto/categoria.dto';
import { ProdutoDTO } from '../../../shared/model/dto/produto.dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-item-produto-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-produto-cadastro.component.html',
  styleUrl: './item-produto-cadastro.component.css'
})
export class ItemProdutoCadastroComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
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
        Swal.fire('Sucesso', 'Item produto registrado com sucesso', 'success');
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

        let mensagemErro = 'Não foi possível registrar o item produto';
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
    this.location.back();
  }
}

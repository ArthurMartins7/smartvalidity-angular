import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Produto } from '../../../../../shared/model/entity/produto';
import { ProdutoService } from '../../../../../shared/service/produto.service';
import { FornecedorService } from '../../../../../shared/service/fornecedor.service';
import { CategoriaService } from '../../../../../shared/service/categoria.service';
import { Fornecedor } from '../../../../../shared/model/entity/fornecedor';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-produto-detalhe',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './produto-detalhe.component.html',
  styleUrl: './produto-detalhe.component.css'
})
export class ProdutoDetalheComponent implements OnInit, AfterViewInit, OnDestroy {

  public produto: Produto = new Produto();
  public idProduto: string;
  public fornecedores: Fornecedor[] = [];
  public fornecedorSelecionado: string;
  public categoriaId: string | null = null;
  public categoriaNome: string = '';
  leitorAberto = false;
  erroLeitura = '';
  private html5QrCode: any;
  private scannerInitialized = false;

  constructor(
    private produtoService: ProdutoService,
    private fornecedorService: FornecedorService,
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.carregarFornecedores();
    this.route.params.subscribe((params) => {
      this.idProduto = params['id'];
      if (this.idProduto) {
        this.buscarProduto();
      }
    });

    this.route.queryParams.subscribe(params => {
      this.categoriaId = params['categoriaId'] || null;
      this.categoriaNome = params['categoriaNome'] || '';

      if (this.categoriaId) {
        // If we have a category ID, create a basic category object
        this.produto.categoria = {
          id: this.categoriaId,
          nome: this.categoriaNome,
          corredor: { id: '' },
          produtos: []
        };
      }
    });
  }

  ngAfterViewInit(): void {
    // nada aqui, inicialização ocorre ao abrir o leitor
  }

  ngOnDestroy(): void {
    this.pararLeitor();
  }

  carregarFornecedores(): void {
    this.fornecedorService.listarTodos().subscribe(
      (fornecedores) => {
        this.fornecedores = fornecedores;
      },
      (erro) => {
        Swal.fire('Erro ao carregar fornecedores!', erro, 'error');
      }
    );
  }

  buscarProduto(): void {
    this.produtoService.buscarPorId(this.idProduto).subscribe(
      (produto) => {
        this.produto = produto;
        this.fornecedorSelecionado = produto.fornecedores?.[0]?.id;
      },
      (erro) => {
        Swal.fire('Erro ao buscar o produto!', erro, 'error');
      }
    );
  }

  salvar(event: Event): void {
    event.preventDefault();

    // Cria um objeto simplificado do produto para enviar ao backend
    const produtoParaSalvar = {
      codigoBarras: this.produto.codigoBarras,
      descricao: this.produto.descricao,
      marca: this.produto.marca,
      unidadeMedida: this.produto.unidadeMedida,
      quantidade: this.produto.quantidade,
      fornecedores: [] as any[],
      categoria: null as any
    };

    // Adiciona o fornecedor se selecionado
    if (this.fornecedorSelecionado) {
      produtoParaSalvar.fornecedores = [{
        id: this.fornecedorSelecionado
      }];
    }

    // Adiciona a categoria se existir
    if (this.categoriaId) {
      produtoParaSalvar.categoria = {
        id: this.categoriaId
      };
    }

    console.log('Dados do produto antes de salvar:', JSON.stringify(produtoParaSalvar, null, 2));

    if (this.idProduto) {
      this.atualizar(produtoParaSalvar);
    } else {
      this.inserir(produtoParaSalvar);
    }
  }

  inserir(produtoParaSalvar: any): void {
    console.log('Criando produto com os dados:', JSON.stringify(produtoParaSalvar, null, 2));
    this.produtoService.criarProduto(produtoParaSalvar).subscribe({
      next: (response) => {
        console.log('Produto criado com sucesso:', response);
        Swal.fire({
          title: 'Sucesso!',
          text: 'Produto salvo com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.voltar();
      },
      error: (erro) => {
        console.error('Erro ao criar produto:', erro);
        console.error('Detalhes do erro:', JSON.stringify(erro, null, 2));
        
        let mensagemErro = 'Ocorreu um erro ao salvar o produto.';
        
        if (erro.error?.codigoBarras) {
          mensagemErro = erro.error.codigoBarras;
        } else if (erro.error?.mensagem) {
          mensagemErro = erro.error.mensagem;
        }

        Swal.fire({
          title: 'Erro ao salvar produto',
          text: 'Código de barras formato EAN13 inválido!',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  atualizar(produtoParaSalvar: any): void {
    this.produtoService.atualizarProduto(this.idProduto, produtoParaSalvar).subscribe(
      () => {
        Swal.fire('Produto atualizado com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao atualizar o produto: ' + erro.error, 'error');
      }
    );
  }

  voltar(): void {
    if (this.categoriaId) {
      this.router.navigate(['/produto-listagem'], { 
        queryParams: { 
          categoriaId: this.categoriaId,
          categoriaNome: this.categoriaNome 
        } 
      });
    } else {
      this.router.navigate(['/produto-listagem']);
    }
  }

  abrirLeitorCodigoBarras() {
    this.leitorAberto = true;
    setTimeout(() => this.iniciarLeitor(), 100);
  }

  fecharLeitorCodigoBarras() {
    this.leitorAberto = false;
    this.pararLeitor();
  }

  async iniciarLeitor() {
    this.erroLeitura = '';
    if (!this.scannerInitialized) {
      // @ts-ignore
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      this.html5QrCode = new Html5Qrcode('barcode-reader');
      this.scannerInitialized = true;
    }
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      formatsToSupport: [
        // @ts-ignore
        window['Html5QrcodeSupportedFormats']?.EAN_13 || 3,
        // outros formatos de barras se desejar
      ]
    };
    this.html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText: string) => this.onCodigoBarrasLido(decodedText),
      (error: any) => {
        // erros de leitura podem ser ignorados para não poluir a UI
      }
    ).catch((err: any) => {
      this.erroLeitura = 'Erro ao acessar a câmera: ' + err;
    });
  }

  pararLeitor() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().catch(() => {});
      this.html5QrCode.clear().catch(() => {});
    }
  }

  onCodigoBarrasLido(codigo: string) {
    if (this.html5QrCode) {
      this.html5QrCode.stop()
        .then(() => this.html5QrCode.clear())
        .then(() => {
          this.leitorAberto = false;
          this.produto.codigoBarras = codigo;
          this.buscarProdutoOpenFoodFacts(codigo);
          this.cdr.detectChanges();
        })
        .catch((err: any) => {
          console.error('Erro ao parar/limpar scanner:', err);
          this.leitorAberto = false;
          this.produto.codigoBarras = codigo;
          this.buscarProdutoOpenFoodFacts(codigo);
          this.cdr.detectChanges();
        });
    } else {
      this.leitorAberto = false;
      this.produto.codigoBarras = codigo;
      this.buscarProdutoOpenFoodFacts(codigo);
      this.cdr.detectChanges();
    }
  }

  buscarProdutoOpenFoodFacts(codigo: string) {
    console.log('Buscando produto na Open Food Facts para o código:', codigo);
    this.http.get<any>(`https://world.openfoodfacts.org/api/v2/product/${codigo}.json`).subscribe({
      next: (res) => {
        console.log('Resposta da Open Food Facts:', res);
        if (res && res.product) {
          const p = res.product;
          // Cria novo objeto Produto para forçar atualização do Angular
          this.produto = Object.assign(new Produto(), {
            codigoBarras: codigo,
            descricao: p.product_name || '',
            marca: (p.brands && typeof p.brands === 'string') ? p.brands.split(',')[0] : '',
            unidadeMedida: p.quantity || '',
            quantidade: this.produto.quantidade,
            categoria: this.produto.categoria,
            itensProduto: this.produto.itensProduto,
            fornecedores: this.produto.fornecedores
          });
          console.log('Novo produto preenchido:', this.produto);
          this.cdr.detectChanges();
        } else {
          this.erroLeitura = 'Produto não encontrado na Open Food Facts.';
          console.warn(this.erroLeitura);
        }
      },
      error: (err) => {
        this.erroLeitura = 'Erro ao buscar produto na Open Food Facts.';
        console.error(this.erroLeitura, err);
      }
    });
  }
}

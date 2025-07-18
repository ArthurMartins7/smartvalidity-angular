import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env';
import Swal from 'sweetalert2';
import { Fornecedor } from '../../../../../shared/model/entity/fornecedor';
import { Produto } from '../../../../../shared/model/entity/produto';
import { CategoriaService } from '../../../../../shared/service/categoria.service';
import { FornecedorService } from '../../../../../shared/service/fornecedor.service';
import { ProdutoService } from '../../../../../shared/service/produto.service';

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
        // Exibe mensagem e só navega depois do usuário confirmar
        Swal.fire({
          title: 'Sucesso!',
          text: 'Produto salvo com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => this.voltar());
      },
      error: (erro) => {
        console.error('Erro ao criar produto:', erro);
        console.error('Detalhes do erro:', JSON.stringify(erro, null, 2));

        // Tenta montar mensagem a partir do payload do backend
        let mensagemErro = 'Ocorreu um erro ao salvar o produto.';

        if (erro.error) {
          const erroPayload = erro.error;

          /*
           * Formato 1 – validação de campos (@Valid):
           *   {
           *     "codigoBarras": "Mensagem...",
           *     "quantidade":   "Mensagem..."
           *   }
           * Formato 2 – SmartValidityException:
           *   { "message": "Mensagem..." }
           */

          if (erroPayload.message) {
            mensagemErro = erroPayload.message;
          } else if (typeof erroPayload === 'object') {
            // Concatena todas as mensagens dos campos – separadas por " / "
            mensagemErro = Object.values(erroPayload).join(' / ');
          } else if (typeof erroPayload === 'string') {
            mensagemErro = erroPayload;
          }
        }

        Swal.fire({
          title: 'Erro ao salvar produto',
          text: mensagemErro,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  atualizar(produtoParaSalvar: any): void {
    this.produtoService.atualizarProduto(this.idProduto, produtoParaSalvar).subscribe(
      () => {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Produto atualizado com sucesso!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => this.voltar());
      },
      (erro) => {
        // Monta mensagem de erro amigável
        let mensagem = 'Erro ao atualizar o produto.';
        if (erro.error) {
          const payload = erro.error;
          if (payload.message) {
            mensagem = payload.message;
          } else if (typeof payload === 'object') {
            mensagem = Object.values(payload).join(' / ');
          } else if (typeof payload === 'string') {
            mensagem = payload;
          }
        }

        Swal.fire({
          title: 'Erro',
          text: mensagem,
          icon: 'error',
          confirmButtonText: 'OK'
        });
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
      try {
        // stop() pode lançar erro síncrono se já não estiver rodando
        const stopResult = this.html5QrCode.stop();
        // Se retornar Promise, suprimir eventual rejeição
        if (stopResult && typeof stopResult.catch === 'function') {
          stopResult.catch(() => {});
        }
      } catch (e) {
        // Ignora erro "Cannot stop, scanner is not running or paused" ou similares
      }

      try {
        const clearResult = this.html5QrCode.clear();
        if (clearResult && typeof clearResult.catch === 'function') {
          clearResult.catch(() => {});
        }
      } catch (e) {
        // Ignora erro se já estiver limpo
      }
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
    // URL base do backend – mantenha consistente com outros services
    const API_URL = environment.apiUrl;
    this.http.get<any>(`${API_URL}/public/openfoodfacts/product/${codigo}`).subscribe({
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

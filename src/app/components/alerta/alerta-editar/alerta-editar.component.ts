import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { ItemProdutoDTO } from '../../../shared/model/dto/item-Produto.dto';
import { Produto } from '../../../shared/model/entity/produto';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { AlertaService } from '../../../shared/service/alerta.service';
import { ItemProdutoService } from '../../../shared/service/item-produto.service';
import { ProdutoService } from '../../../shared/service/produto.service';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-alerta-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerta-editar.component.html',
  styleUrl: './alerta-editar.component.css'
})
export class AlertaEditarComponent implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private produtoService = inject(ProdutoService);
  private usuarioService = inject(UsuarioService);
  private itemProdutoService = inject(ItemProdutoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private destroy$ = new Subject<void>();

  public alertaDTO: AlertaDTO.Cadastro = new AlertaDTO.Cadastro();
  public produtos: Produto[] = [];
  public usuarios: Usuario[] = [];
  public isEdicao: boolean = false;
  public alertaId: number | null = null;
  public carregando: boolean = false;

  // campos formulário
  public produtoSelecionado: string = '';
  public descricaoProdutoSelecionado: string = '';
  public usuariosSelecionados: string[] = [];
  public itensProdutoNaoInspecionados: ItemProdutoDTO[] = [];
  
  // validação visual
  public colaboradoresObrigatorioTouched: boolean = false;

  // campos de busca de produtos
  public termoBuscaProduto: string = '';
  public produtosFiltrados: Produto[] = [];
  public mostrarDropdown: boolean = false;
  private searchSubject = new Subject<string>();

  // usuários
  public termoBuscaUsuario: string = '';
  public usuariosFiltrados: Usuario[] = [];
  public mostrarDropdownUsuarios: boolean = false;
  private searchUsuarioSubject = new Subject<string>();

  public TipoAlerta = TipoAlerta;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.alertaId = parseInt(id);
        this.isEdicao = true;
        this.carregarAlerta();
      }
    });

    this.carregarUsuarios();
    this.inicializarAlerta();
    this.setupProdutoSearch();
    this.setupUsuarioSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // configura a busca de produtos com debounce:
  private setupProdutoSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termo => {
        return termo.length >= 2
          ? this.produtoService.buscarPorTermo(termo)
          : of([]);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: produtos => {
        this.produtosFiltrados = produtos;
        this.mostrarDropdown = produtos.length > 0;
      },
      error: error => {
        console.error('Erro na busca de produtos:', error);
        this.produtosFiltrados = [];
        this.mostrarDropdown = false;
      }
    });
  }

  // chamado quando o usuário digita na busca de produto:
  public onBuscaProdutoChange(): void {
    this.searchSubject.next(this.termoBuscaProduto);
    if (this.termoBuscaProduto.length < 2) {
      this.mostrarDropdown = false;
      this.produtosFiltrados = [];
    }
  }

   // quando o usuário seleciona um produto do dropdown
  public selecionarProduto(produto: Produto): void {
    this.produtoSelecionado = produto.id;
    this.descricaoProdutoSelecionado = produto.descricao;
    this.termoBuscaProduto = produto.descricao;
    this.mostrarDropdown = false;
    this.onProdutoSelecionado();
  }

  public limparSelecaoProduto(): void {
    this.produtoSelecionado = '';
    this.descricaoProdutoSelecionado = '';
    this.termoBuscaProduto = '';
    this.itensProdutoNaoInspecionados = [];
    this.mostrarDropdown = false;
  }

   // fecha dropdown com delay (para permitir clique nos itens)
  public fecharDropdownComDelay(): void {
    setTimeout(() => {
      this.mostrarDropdown = false;
    }, 200);
  }

  public getStatusVencimento(dataVencimento: Date | string): string {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays === 0) return 'bg-orange-100 text-orange-800';
    if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }


  // recebe o texto do status de vencimento:
  public getTextoVencimento(dataVencimento: Date | string): string {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDays = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoje';
    if (diffDays === 1) return 'Vence amanhã';
    return `${diffDays} dias`;
  }

  // alertas criados pelo usuário são sempre setados como personalizado
  private inicializarAlerta(): void {
    if (!this.isEdicao) {
      this.alertaDTO = new AlertaDTO.Cadastro();
      this.alertaDTO.tipo = TipoAlerta.PERSONALIZADO;
    }
  }

  private carregarAlerta(): void {
    if (!this.alertaId) return;

    this.carregando = true;
    this.alertaService.buscarPorId(this.alertaId).subscribe({
      next: (alerta) => {
        console.log('Alerta carregado:', alerta);  // Log para debugging
        // verifica se é um alerta automático
        if (alerta.tipo !== TipoAlerta.PERSONALIZADO) {
          Swal.fire('Atenção!', 'Alertas automáticos não podem ser editados.', 'warning');
          this.voltar();
          return;
        }

        this.alertaDTO = new AlertaDTO.Cadastro();
        this.alertaDTO.titulo = alerta.titulo;
        this.alertaDTO.descricao = alerta.descricao;
        this.alertaDTO.tipo = TipoAlerta.PERSONALIZADO;
        this.alertaDTO.produtosIds = alerta.produtosAlertaIds ? [...alerta.produtosAlertaIds] : [];
        this.alertaDTO.usuariosIds = alerta.usuariosAlertaIds ? [...alerta.usuariosAlertaIds] : [];
        this.usuariosSelecionados = alerta.usuariosAlertaIds ? [...alerta.usuariosAlertaIds] : [];

        if (alerta.produtosAlertaIds && alerta.produtosAlertaIds.length > 0) {
          this.produtoSelecionado = alerta.produtosAlertaIds[0];
          this.produtoService.buscarPorId(this.produtoSelecionado).subscribe({
            next: (produto) => {
              this.termoBuscaProduto = produto.descricao;
              this.descricaoProdutoSelecionado = produto.descricao;
              this.onProdutoSelecionado();
            },
            error: (error) => {
              console.warn('Produto não encontrado para preenchimento do campo:', error);
              this.termoBuscaProduto = '';
            }
          });
        }

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar alerta:', erro);
        Swal.fire('Erro!', 'Não foi possível carregar o alerta.', 'error');
        this.carregando = false;
        this.voltar();
      }
    });
  }

  private carregarUsuarios(): void {
    this.usuarioService.buscarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (erro) => {
        console.error('Erro ao carregar usuários:', erro);
      }
    });
  }

  public salvar(): void {
    // Marca colaboradores como obrigatórios apenas para novos alertas
    if (!this.isEdicao) {
      this.colaboradoresObrigatorioTouched = true;
    }
    
    if (!this.validarFormulario()) {
      return;
    }

    this.alertaDTO.produtosIds = this.produtoSelecionado ? [this.produtoSelecionado] : [];
    this.alertaDTO.usuariosIds = this.usuariosSelecionados;
    this.carregando = true;

    if (this.isEdicao && this.alertaId) {
      this.atualizarAlerta();
    } else {
      this.criarAlerta();
    }
  }

  private criarAlerta(): void {
    this.alertaDTO.tipo = TipoAlerta.PERSONALIZADO;

    console.log('DTO sendo enviado:', this.alertaDTO);

    this.alertaService.criarAlerta(this.alertaDTO).subscribe({
      next: (alertaCriado) => {
        Swal.fire('Sucesso!', 'Alerta criado com sucesso. As notificações foram geradas automaticamente.', 'success');
        this.carregando = false;
        this.voltar();
      },
      error: (erro) => {
        console.error('Erro ao criar alerta:', erro);
        Swal.fire('Erro!', 'Não foi possível criar o alerta.', 'error');
        this.carregando = false;
      }
    });
  }

  private atualizarAlerta(): void {
    if (!this.alertaId) return;

    console.log('DTO de edição sendo enviado:', this.alertaDTO);  // Log para debugging

    this.alertaService.atualizarAlerta(this.alertaId, this.alertaDTO).subscribe({
      next: (alertaAtualizado) => {
        Swal.fire('Sucesso!', 'Alerta atualizado com sucesso.', 'success');
        this.carregando = false;
        this.voltar();
      },
      error: (erro) => {
        console.error('Erro ao atualizar alerta:', erro);
        Swal.fire('Erro!', 'Não foi possível atualizar o alerta.', 'error');
        this.carregando = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.alertaDTO.titulo?.trim()) {
      Swal.fire('Atenção!', 'O título é obrigatório.', 'warning');
      return false;
    }

    if (!this.alertaDTO.descricao?.trim()) {
      Swal.fire('Atenção!', 'A descrição é obrigatória.', 'warning');
      return false;
    }

    // Validação de colaboradores obrigatórios apenas para novos alertas
    if (!this.isEdicao && (!this.usuariosSelecionados || this.usuariosSelecionados.length === 0)) {
      Swal.fire('Atenção!', 'Pelo menos um colaborador deve ser selecionado.', 'warning');
      return false;
    }

    return true;
  }

  public voltar(): void {
    this.location.back();
  }

  public obterTituloTela(): string {
    return this.isEdicao ? 'Editar Alerta' : 'Criar Alerta';
  }

  public toggleUsuario(usuarioId: string): void {
    const index = this.usuariosSelecionados.indexOf(usuarioId);
    if (index > -1) {
      this.usuariosSelecionados.splice(index, 1);
    } else {
      this.usuariosSelecionados.push(usuarioId);
    }
  }

  public isUsuarioSelecionado(usuarioId: string): boolean {
    return this.usuariosSelecionados.includes(usuarioId);
  }

  public onProdutoSelecionado(): void {
    if (this.produtoSelecionado) {
      console.log('Produto selecionado:', this.produtoSelecionado);

      this.itemProdutoService.buscarItensProdutoNaoInspecionadosPorProduto(this.produtoSelecionado)
        .subscribe({
          next: (itens: ItemProdutoDTO[]) => {
            this.itensProdutoNaoInspecionados = itens;
            console.log(`Encontrados ${itens.length} itens-produto não inspecionados para o produto:`, itens);
          },
          error: (erro: any) => {
            console.error('Erro ao buscar itens-produto não inspecionados:', erro);
            this.itensProdutoNaoInspecionados = [];
          }
        });
    } else {
      this.itensProdutoNaoInspecionados = [];
    }
  }

  public executarBuscaProduto(): void {
    const termo = this.termoBuscaProduto?.trim();
    if (!termo || termo.length < 2) {
      this.mostrarDropdown = false;
      this.produtosFiltrados = [];
      return;
    }

    this.produtoService.buscarPorTermo(termo).subscribe({
      next: produtos => {
        this.produtosFiltrados = produtos;
        this.mostrarDropdown = produtos.length > 0;
      },
      error: erro => {
        console.error('Erro na busca de produtos:', erro);
        this.produtosFiltrados = [];
        this.mostrarDropdown = false;
      }
    });
  }

  private setupUsuarioSearch(): void {
    this.searchUsuarioSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termo => {
        const t = termo.trim().toLowerCase();
        return of(
          t.length >= 2
            ? this.usuarios.filter(u => u.nome.toLowerCase().includes(t) || u.email.toLowerCase().includes(t))
            : []
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: usuarios => {
        this.usuariosFiltrados = usuarios;
        this.mostrarDropdownUsuarios = usuarios.length > 0;
      },
      error: () => {
        this.usuariosFiltrados = [];
        this.mostrarDropdownUsuarios = false;
      }
    });
  }

  public onBuscaUsuarioChange(): void {
    this.searchUsuarioSubject.next(this.termoBuscaUsuario);
    if (this.termoBuscaUsuario.length < 2) {
      this.mostrarDropdownUsuarios = false;
      this.usuariosFiltrados = [];
    }
  }

  public selecionarUsuario(usuario: Usuario): void {
    if (!this.usuariosSelecionados.includes(usuario.id)) {
      this.usuariosSelecionados.push(usuario.id);
    }
    this.termoBuscaUsuario = '';
    this.mostrarDropdownUsuarios = false;
    this.colaboradoresObrigatorioTouched = true;
  }

  public removerUsuario(usuarioId: string): void {
    const index = this.usuariosSelecionados.indexOf(usuarioId);
    if (index > -1) {
      this.usuariosSelecionados.splice(index, 1);
    }
    this.colaboradoresObrigatorioTouched = true;
  }

  public obterUsuarioPorId(id: string): Usuario | undefined {
    return this.usuarios.find(u => u.id === id);
  }

  public isColaboradoresInvalido(): boolean {
    // Mostra erro apenas para novos alertas, não para edições
    return !this.isEdicao && this.colaboradoresObrigatorioTouched && (!this.usuariosSelecionados || this.usuariosSelecionados.length === 0);
  }

  public visualizarItem(item: ItemProdutoDTO): void {
    if (!item.id) return;
    this.router.navigate(['/mural-detalhe', item.id], { queryParams: { tab: 'proximo' } });
  }

  public get dataAtual(): Date {
    return new Date();
  }
}

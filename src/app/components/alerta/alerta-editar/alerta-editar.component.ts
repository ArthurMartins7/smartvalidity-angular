import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AlertaDTO } from '../../../shared/model/dto/alerta.dto';
import { Produto } from '../../../shared/model/entity/produto';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { TipoAlerta } from '../../../shared/model/enum/tipo-alerta.enum';
import { AlertaService } from '../../../shared/service/alerta.service';
import { ProdutoService } from '../../../shared/service/produto.service';
import { UsuarioService } from '../../../shared/service/usuario.service';

@Component({
  selector: 'app-alerta-editar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerta-editar.component.html',
  styleUrl: './alerta-editar.component.css'
})
export class AlertaEditarComponent implements OnInit {
  private alertaService = inject(AlertaService);
  private produtoService = inject(ProdutoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public alertaDTO: AlertaDTO.Cadastro = new AlertaDTO.Cadastro();
  public produtos: Produto[] = [];
  public usuarios: Usuario[] = [];
  public isEdicao: boolean = false;
  public alertaId: number | null = null;
  public carregando: boolean = false;

  // Campos auxiliares para o formulário
  public produtoSelecionado: string = '';
  public usuariosSelecionados: string[] = [];

  // Enums para template
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

    this.carregarProdutos();
    this.carregarUsuarios();
    this.inicializarAlerta();
  }

  private inicializarAlerta(): void {
    if (!this.isEdicao) {
      this.alertaDTO = new AlertaDTO.Cadastro();
      // Alertas criados pelo usuário são sempre do tipo PERSONALIZADO
      this.alertaDTO.tipo = TipoAlerta.PERSONALIZADO;
      this.alertaDTO.recorrente = false;
    }
  }

  private carregarAlerta(): void {
    if (!this.alertaId) return;

    this.carregando = true;
    this.alertaService.buscarPorId(this.alertaId).subscribe({
      next: (alerta) => {
        // Verificar se é um alerta automático (não editável)
        if (alerta.tipo !== TipoAlerta.PERSONALIZADO) {
          Swal.fire('Atenção!', 'Alertas automáticos não podem ser editados.', 'warning');
          this.voltar();
          return;
        }

        // No modo edição, construir um objeto adequado para o formulário
        this.alertaDTO = new AlertaDTO.Cadastro();
        this.alertaDTO.titulo = alerta.titulo;
        this.alertaDTO.descricao = alerta.descricao;
        // Alertas editáveis são sempre PERSONALIZADO (garantia adicional)
        this.alertaDTO.tipo = TipoAlerta.PERSONALIZADO;
        this.alertaDTO.recorrente = alerta.recorrente;
        this.alertaDTO.dataHoraDisparo = alerta.dataHoraDisparo;
        this.alertaDTO.diasAntecedencia = alerta.diasAntecedencia;
        this.alertaDTO.configuracaoRecorrencia = alerta.configuracaoRecorrencia;
        this.alertaDTO.produtosIds = alerta.produtosAlertaIds ? [...alerta.produtosAlertaIds] : [];
        this.alertaDTO.usuariosIds = alerta.usuariosAlertaIds ? [...alerta.usuariosAlertaIds] : [];
        this.usuariosSelecionados = [...this.alertaDTO.usuariosIds];

        if (alerta.produtosAlertaIds && alerta.produtosAlertaIds.length > 0) {
          this.produtoSelecionado = alerta.produtosAlertaIds[0];
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

  private carregarProdutos(): void {
    this.produtoService.listarTodos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
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
    if (!this.validarFormulario()) {
      return;
    }

    // Preparar arrays antes de salvar
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
    // Garantir que o tipo seja sempre PERSONALIZADO para alertas criados pelo usuário
    this.alertaDTO.tipo = TipoAlerta.PERSONALIZADO;
    
    this.alertaService.criarAlerta(this.alertaDTO).subscribe({
      next: (alertaCriado) => {
        Swal.fire('Sucesso!', 'Alerta criado com sucesso.', 'success');
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

    const edicaoDTO: AlertaDTO.Edicao = {
      titulo: this.alertaDTO.titulo,
      descricao: this.alertaDTO.descricao,
      dataHoraDisparo: this.alertaDTO.dataHoraDisparo,
      diasAntecedencia: this.alertaDTO.diasAntecedencia,
      recorrente: this.alertaDTO.recorrente,
      configuracaoRecorrencia: this.alertaDTO.configuracaoRecorrencia,
      produtosIds: this.produtoSelecionado ? [this.produtoSelecionado] : [],
      usuariosIds: this.usuariosSelecionados
    };

    this.alertaService.atualizarAlerta(this.alertaId, edicaoDTO).subscribe({
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

    if (!this.alertaDTO.dataHoraDisparo) {
      Swal.fire('Atenção!', 'A data/hora de disparo é obrigatória.', 'warning');
      return false;
    }

    // Validação de apresentação apenas - lógica de negócio fica no backend
    return true;
  }

  public voltar(): void {
    this.router.navigate(['/alertas']);
  }

  public obterTituloTela(): string {
    return this.isEdicao ? 'Editar Alerta' : 'Criar Alerta';
  }



  public formatarDataHoraInput(data: Date): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toISOString().slice(0, 16);
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
}

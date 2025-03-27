import { Component, OnInit } from '@angular/core';
import { Corredor } from '../../../shared/model/entity/corredor';
import { FormsModule } from '@angular/forms';
import { CorredorService } from '../../../shared/service/corredor.service';
import { UsuarioService } from '../../../shared/service/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { CommonModule } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-corredor-detalhe',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './corredor-detalhe.component.html',
  styleUrl: './corredor-detalhe.component.css'
})
export class CorredorDetalheComponent implements OnInit {

  public corredor: Corredor = new Corredor();
  public idCorredor: number;
  public responsaveisDisponiveis: Usuario[] = [];

  constructor(
    private corredorService: CorredorService,
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.idCorredor = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    if (this.idCorredor) {
      this.carregarCorredor();
    }
    this.carregarResponsaveis();
  }

  public carregarCorredor(): void {
    this.corredorService.buscarPorId(this.idCorredor).subscribe(
      (corredor) => {
        this.corredor = corredor;
      },
      (erro) => {
        console.error('Erro ao carregar corredor:', erro);
        Swal.fire('Erro', 'Não foi possível carregar o corredor!', 'error');
      }
    );
  }

  public carregarResponsaveis(): void {
    this.usuarioService.buscarTodos().subscribe(
      (responsaveis) => {
        this.responsaveisDisponiveis = responsaveis;
      },
      (erro) => {
        console.error('Erro ao carregar responsáveis:', erro);
        Swal.fire('Erro', 'Não foi possível carregar os responsáveis!', 'error');
      }
    );
  }

  salvar(): void {
    if (!this.corredor.nome || !this.corredor.responsaveis || this.corredor.responsaveis.length === 0) {
      Swal.fire('Preencha todos os campos obrigatórios!', '', 'warning');
      return;
    }

    if (this.idCorredor) {
      this.alterar();
    } else {
      this.inserir();
    }
  }

  public inserir(): void {
    console.log('Corredor a ser enviado:', this.corredor); // Verifique a estrutura do objeto

    // Mapeamento de dados (se necessário)
    const corredorMapeado = {
      ...this.corredor,
      responsaveis: this.corredor.responsaveis.map(responsavel => {
        return {
          id: responsavel.id,
          perfilAcesso: responsavel.perfilAcesso,
          cpf: responsavel.cpf,
          nome: responsavel.nome,
          email: responsavel.email,
          senha: responsavel.senha
        };
      })
    };

    this.corredorService.criarCorredor(corredorMapeado)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao salvar o corredor:', error);
          Swal.fire('Erro ao salvar o corredor!', error.error.message || 'Erro desconhecido', 'error');
          return throwError(error);
        })
      )
      .subscribe(
        () => {
          Swal.fire('Corredor salvo com sucesso!', '', 'success');
          this.voltar();
        }
      );
  }

  private alterar(): void {
    this.corredorService.atualizarCorredor(this.idCorredor!, this.corredor).subscribe(
      () => {
        Swal.fire('Corredor atualizado com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao atualizar o corredor!', erro.error.mensagem, 'error');
      }
    );
  }

  public voltar(): void {
    this.router.navigate(['corredor']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Corredor } from '../../../../shared/model/entity/corredor';
import { Usuario } from '../../../../shared/model/entity/usuario.model';
import { CorredorService } from '../../../../shared/service/corredor.service';
import { UsuarioService } from '../../../../shared/service/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-corredor-editar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './corredor-editar.component.html',
  styleUrl: './corredor-editar.component.css'
})
export class CorredorEditarComponent implements OnInit {

  public corredor: Corredor = new Corredor();
  public idCorredor: number;
  public responsaveisDisponiveis: Usuario[] = [];
  public selectedFile: File | null = null;
  public responsavelSelecionado: Usuario | null = null;

  constructor(
    private corredorService: CorredorService,
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.idCorredor = Number(this.activatedRoute.snapshot.paramMap.get('id')) || 0;
    if (this.idCorredor) {
      this.carregarCorredor();
    }
    this.carregarResponsaveis();
  }

  public carregarCorredor(): void {
    this.corredorService.buscarPorId(this.idCorredor).subscribe(
      (corredor) => {
        this.corredor = corredor;
        if (corredor.responsaveis && corredor.responsaveis.length > 0) {
          this.responsavelSelecionado = this.responsaveisDisponiveis.find(
            r => r.id === corredor.responsaveis[0].id
          ) || null;
        }
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
        if (this.corredor.responsaveis && this.corredor.responsaveis.length > 0) {
          this.responsavelSelecionado = responsaveis.find(
            r => r.id === this.corredor.responsaveis[0].id
          ) || null;
        }
      },
      (erro) => {
        console.error('Erro ao carregar responsáveis:', erro);
        Swal.fire('Erro', 'Não foi possível carregar os responsáveis!', 'error');
      }
    );
  }

  atualizar(): void {
    if (!this.corredor.nome || !this.responsavelSelecionado) {
      Swal.fire('Preencha todos os campos obrigatórios!', '', 'warning');
      return;
    }

    console.log('Corredor a ser atualizado:', this.corredor);

    const corredorMapeado = {
      ...this.corredor,
      responsaveis: [
        {
          id: this.responsavelSelecionado.id,
          perfilAcesso: this.responsavelSelecionado.perfilAcesso,
          cpf: this.responsavelSelecionado.cpf,
          nome: this.responsavelSelecionado.nome,
          email: this.responsavelSelecionado.email,
          senha: this.responsavelSelecionado.senha
        }
      ]
    };

    this.corredorService.atualizarCorredor(this.idCorredor, corredorMapeado)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao atualizar o corredor:', error);
          Swal.fire('Erro ao atualizar o corredor!', error.error?.mensagem || error.message || 'Erro desconhecido', 'error');
          return throwError(error);
        })
      )
      .subscribe(
        (resposta) => {
          Swal.fire('Corredor atualizado com sucesso!', '', 'success');
          if (this.selectedFile) {
            this.uploadImagem(resposta.id);
          } else {
            this.voltar();
          }
        }
      );
  }

  public voltar(): void {
    this.router.navigate(['corredor']);
  }

  uploadImagem(id: number): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        this.corredorService.uploadImagem(id, formData).subscribe(
          () => {
            this.carregarCorredor();
          },
          (erro) => {
            console.error('Erro ao fazer upload da imagem:', erro);
            Swal.fire('Erro!', 'Não foi possível fazer upload da imagem.', 'error');
          }
        );
      }
    };
    input.click();
  }
}

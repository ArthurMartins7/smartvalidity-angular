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
  public idCorredor: string;
  public responsaveisDisponiveis: Usuario[] = [];
  public selectedFile: File | null = null;
  public responsavelSelecionado: Usuario | null = null;
  public imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private corredorService: CorredorService,
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.idCorredor = String(this.activatedRoute.snapshot.paramMap.get('id')) || "";
    if (this.idCorredor) {
      this.carregarResponsaveis().then(() => {
        this.carregarCorredor();
      });
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Tamanho de arquivo não permitido! Máximo: 10MB.');
      this.selectedFile = null;
      this.imagePreview = null;
    }
  }

  public carregarCorredor(): void {
    this.corredorService.buscarPorId(this.idCorredor).subscribe(
      (corredor) => {
        this.corredor = corredor;
        if (corredor.imagemEmBase64) {
          this.imagePreview = 'data:image/jpeg;base64,' + corredor.imagemEmBase64;
        }
        if (!this.corredor.responsaveis) {
          this.corredor.responsaveis = [];
        }
      },
      (erro) => {
        console.error('Erro ao carregar corredor:', erro);
        Swal.fire('Erro', 'Não foi possível carregar o corredor!', 'error');
      }
    );
  }

  public carregarResponsaveis(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.buscarTodos().subscribe(
        (responsaveis) => {
          this.responsaveisDisponiveis = responsaveis;
          resolve();
        },
        (erro) => {
          console.error('Erro ao carregar responsáveis:', erro);
          Swal.fire('Erro', 'Não foi possível carregar os responsáveis!', 'error');
          reject(erro);
        }
      );
    });
  }

  public adicionarResponsavel(): void {
    if (this.responsavelSelecionado && !this.corredor.responsaveis.some(r => r.id === this.responsavelSelecionado!.id)) {
      this.corredor.responsaveis.push(this.responsavelSelecionado);
      this.responsavelSelecionado = null;
    }
  }

  public removerResponsavel(index: number): void {
    this.corredor.responsaveis.splice(index, 1);
  }

  atualizar(): void {
    if (!this.corredor.nome || this.corredor.responsaveis.length === 0) {
      Swal.fire('Preencha todos os campos obrigatórios e adicione pelo menos um responsável!', '', 'warning');
      return;
    }

    const responsaveisMapeados = this.corredor.responsaveis.map(responsavel => ({
      id: responsavel.id,
      perfilAcesso: responsavel.perfilAcesso,
      cpf: responsavel.cpf,
      nome: responsavel.nome,
      email: responsavel.email,
      senha: responsavel.senha
    }));

    const corredorMapeado = {
      ...this.corredor,
      responsaveis: responsaveisMapeados
    };

    this.corredorService.atualizarCorredor(this.idCorredor, corredorMapeado)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao atualizar o corredor:', error);
          Swal.fire('Erro ao atualizar o corredor!', error.error?.mensagem || error.message || 'Erro desconhecido', 'error');
          return throwError(error);
        })
      )
      .subscribe({
        next: (resposta) => {
          if (this.selectedFile) {
            const formData = new FormData();
            formData.append('imagem', this.selectedFile);

            this.corredorService.uploadImagem(this.idCorredor, formData).subscribe({
              next: () => {
                Swal.fire('Corredor atualizado com sucesso!', '', 'success');
                this.voltar();
              },
              error: (erro) => {
                console.error('Erro ao fazer upload da imagem:', erro);
                Swal.fire('Erro ao fazer upload da imagem!', erro.error?.mensagem || erro.message || 'Erro desconhecido', 'error');
              }
            });
          } else {
            Swal.fire('Corredor atualizado com sucesso!', '', 'success');
            this.voltar();
          }
        }
      });
  }

  public voltar(): void {
    this.router.navigate(['corredor']);
  }
}

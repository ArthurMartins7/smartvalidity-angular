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

  atualizar(): void {
    if (!this.corredor.nome || !this.responsavelSelecionado) {
      Swal.fire('Preencha todos os campos obrigatórios!', '', 'warning');
      return;
    }

    const corredorMapeado = {
      ...this.corredor,
      responsaveis: [
        {
          id: this.responsavelSelecionado.id,
          perfilAcesso: this.responsavelSelecionado.perfilAcesso,
          //cpf: this.responsavelSelecionado.cpf,
          nome: this.responsavelSelecionado.nome,
          email: this.responsavelSelecionado.email,
          senha: this.responsavelSelecionado.senha,
          cargo: this.responsavelSelecionado.cargo,
          dataCriacao: this.responsavelSelecionado.dataCriacao,
          empresa: this.responsavelSelecionado.empresa
        }
      ]
    };

    // Primeiro atualiza os dados do corredor
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
          // Se houver uma nova imagem selecionada, faz o upload
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

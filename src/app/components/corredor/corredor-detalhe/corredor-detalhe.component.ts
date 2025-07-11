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
import { Location } from '@angular/common';

@Component({
  selector: 'app-corredor-detalhe',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './corredor-detalhe.component.html',
  styleUrl: './corredor-detalhe.component.css'
})
export class CorredorDetalheComponent implements OnInit {

  public corredor: Corredor = new Corredor();
  public idCorredor: string;
  public responsaveisDisponiveis: Usuario[] = [];
  public responsavelSelecionado: Usuario | null = null;
  public selectedFile: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private corredorService: CorredorService,
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    //this.idCorredor = String(this.activatedRoute.snapshot.paramMap.get('id'));

    this.carregarResponsaveis();
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
        if (corredor.responsaveis && corredor.responsaveis.length > 0) {
          this.responsavelSelecionado = corredor.responsaveis[0];
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
      },
      (erro) => {
        console.error('Erro ao carregar responsáveis:', erro);
        Swal.fire('Erro', 'Não foi possível carregar os responsáveis!', 'error');
      }
    );
  }

  public adicionarResponsavel(): void {
    if (
      this.responsavelSelecionado &&
      !this.corredor.responsaveis.some(r => r.id === this.responsavelSelecionado!.id)
    ) {
      // Cria um clone limpo, sem authorities e campos do Spring Security
      const responsavelLimpo: Usuario = {
        id: this.responsavelSelecionado.id,
        nome: this.responsavelSelecionado.nome,
        email: this.responsavelSelecionado.email,
        perfilAcesso: this.responsavelSelecionado.perfilAcesso,
        senha: this.responsavelSelecionado.senha,
        cargo: this.responsavelSelecionado.cargo,
        dataCriacao: new Date(this.responsavelSelecionado.dataCriacao as any),
        empresa: this.responsavelSelecionado.empresa
      };
      this.corredor.responsaveis.push(responsavelLimpo);
      this.responsavelSelecionado = null;
    }
  }

  public removerResponsavel(index: number): void {
    this.corredor.responsaveis.splice(index, 1);
  }

  salvar(): void {
    if (!this.corredor.nome || this.corredor.responsaveis.length === 0) {
      Swal.fire('Preencha todos os campos obrigatórios e adicione pelo menos um responsável!', '', 'warning');
      return;
    }

    // Não sobrescreve os responsáveis, apenas salva o corredor com os responsáveis já adicionados
    if (this.idCorredor) {
      this.atualizar();
    } else {
      this.inserir();
    }
  }

  public inserir(): void {
    this.corredorService.criarCorredor(this.corredor)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao salvar o corredor:', error);
          Swal.fire('Erro ao salvar o corredor!', error.error.message || 'Erro desconhecido', 'error');
          return throwError(error);
        })
      )
      .subscribe(
        (resposta) => {
          if (this.selectedFile) {
            const formData = new FormData();
            formData.append('imagem', this.selectedFile);

            this.corredorService.uploadImagem(resposta.id, formData).subscribe({
              next: () => {
                Swal.fire('Corredor salvo com sucesso!', '', 'success');
                this.voltar();
              },
              error: (erro) => {
                console.error('Erro ao fazer upload da imagem:', erro);
                Swal.fire('Erro ao fazer upload da imagem!', erro.error?.mensagem || erro.message || 'Erro desconhecido', 'error');
                this.voltar();
              }
            });
          } else {
            Swal.fire('Corredor salvo com sucesso!', '', 'success');
            this.voltar();
          }
        }
      );
  }

  private atualizar(): void {
    this.corredorService.atualizarCorredor(this.idCorredor!, this.corredor).subscribe(
      (resposta) => {
        Swal.fire('Corredor atualizado com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao atualizar o corredor!', erro.error.mensagem || 'Erro desconhecido', 'error');
      }
    );
  }

  public voltar(): void {
    this.location.back();
  }
}

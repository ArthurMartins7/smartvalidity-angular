import { Component, OnInit } from '@angular/core';
import { Corredor } from '../../../shared/model/entity/corredor';
import { FormsModule } from '@angular/forms';
import { CorredorService } from '../../../shared/service/corredor.service';
import { UsuarioService } from '../../../shared/service/usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { CommonModule } from '@angular/common';

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
    this.carregarResponsaveis();


  }

  public carregarResponsaveis(): void {
    this.usuarioService.buscarTodos().subscribe(
      (responsaveis) => {
        this.responsaveisDisponiveis = responsaveis;
        console.log(this.responsaveisDisponiveis);
      },
      (erro) => {
        console.error('Erro ao carregar responsáveis:', erro);
      }
    );
  }

  salvar(): void {
    console.log('Corredor a ser salvo:', this.corredor);

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
    this.corredorService.criarCorredor(this.corredor).subscribe(
      () => {
        Swal.fire('Corredor salvo com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao salvar um corredor!', erro.error.mensagem, 'error');
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

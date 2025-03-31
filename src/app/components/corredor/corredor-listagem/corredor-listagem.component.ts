import { Component, inject, OnInit} from '@angular/core';
import { FormsModule} from '@angular/forms';
import { Corredor } from '../../../shared/model/entity/corredor';
import { CategoriaService } from '../../../shared/service/categoria.service';
import { CorredorService } from '../../../shared/service/corredor.service';
import { Categoria } from '../../../shared/model/entity/categoria';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-corredor-listagem',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './corredor-listagem.component.html',
  styleUrl: './corredor-listagem.component.css'
})
export class CorredorListagemComponent implements OnInit {

  private categoriaService = inject(CategoriaService);
  private corredorService = inject(CorredorService);
  private router = inject(Router);

  public Corredor = new Corredor();
  public corredores: Corredor[] = [];
  public categorias: Categoria[] = [];

  ngOnInit(): void {
    this.buscarCorredores();
  }

  public buscarCorredores() {
    this.corredorService.listarTodos().subscribe(
      (resultado) => {
        this.corredores = resultado;
        console.log(this.corredores);
      },
      (erro) => {
        console.error('Erro ao consultar todos os corredores', erro.error.mensagem);
      }
    );
  }

  excluir(corredorSelecionado: Corredor) {
    Swal.fire({
      title: 'Deseja realmente excluir o corredor?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.corredorService.excluirCorredor(corredorSelecionado.id).subscribe(
          () => {
            this.corredores = this.corredores.filter(c => c.id !== corredorSelecionado.id);
            Swal.fire('Excluído!', 'O corredor foi removido com sucesso.', 'success');
          },
          erro => {
            Swal.fire('Corredor possui categoria associada!', erro.error, 'error');
          }
        );
      }
    });
  }

  editar(corredorSelecionado: Corredor){
    this.router.navigate(['/corredor-editar/', corredorSelecionado]);
  }

  public adicionarCorredor() {
    this.router.navigate(['corredor-detalhe']);
  }
}

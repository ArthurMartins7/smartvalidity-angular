import { Component, inject, OnInit} from '@angular/core';
import { FormsModule} from '@angular/forms';
import { Corredor } from '../../../shared/model/entity/corredor';
import { CategoriaService } from '../../../shared/service/categoria.service';
import { CorredorService } from '../../../shared/service/corredor.service';
import { Categoria } from '../../../shared/model/entity/categoria';

@Component({
  selector: 'app-corredor-listagem',
  standalone: true,
  imports: [ FormsModule],
  templateUrl: './corredor-listagem.component.html',
  styleUrl: './corredor-listagem.component.css'
})
export class CorredorListagemComponent implements OnInit {

  private categoriaService = inject(CategoriaService);
  private corredorService = inject(CorredorService);

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

}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../../shared/model/entity/categoria';
import { CategoriaService } from '../../../../shared/service/categoria.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categoria-detalhe',
  imports: [FormsModule],
  templateUrl: './categoria-detalhe.component.html',
  styleUrl: './categoria-detalhe.component.css'
})
export class CategoriaDetalheComponent implements OnInit {
  public categoria: Categoria = new Categoria();
  public corredorId: number; // Armazena o ID do corredor

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.corredorId = Number(this.route.snapshot.queryParamMap.get('corredorId'));
    this.categoria.corredor = { id: this.corredorId };
  }

  salvar(event: Event): void {
    event.preventDefault();
    this.inserir();
  }

  inserir(): void {
    this.categoriaService.criarCategoria(this.categoria).subscribe(
      () => {
        Swal.fire('Categoria salva com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao salvar a categoria: ' + erro.error, 'error');
      }
    );
  }

  voltar(): void {
    this.router.navigate(['/corredor']);
  }
}

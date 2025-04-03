import { Component } from '@angular/core';
import { Fornecedor } from '../../../../shared/model/entity/fornecedor';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fornecedor-detalhe',
  imports: [FormsModule],
  templateUrl: './fornecedor-detalhe.component.html',
  styleUrl: './fornecedor-detalhe.component.css'
})
export class FornecedorDetalheComponent {

  public fornecedor: Fornecedor = new Fornecedor();
  public idFornecedor: number;

  constructor(private fornecedorService: FornecedorService,
    private router: Router,
    private route: ActivatedRoute
) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idFornecedor = params['id'];
      if(this.idFornecedor) {
        this.buscarFornecedor();
      }
    });
  }

  buscarFornecedor(): void {
    this.fornecedorService.buscarPorId(this.idFornecedor).subscribe(
      (carta) => {
        this.fornecedor = carta;
      },
      (erro) => {
        Swal.fire('Erro ao buscar o fornecedor!', erro, 'error');
      }
    );
  }

  salvar(event: Event): void {
    event.preventDefault();

    this.inserir();
}

inserir(): void {
    this.fornecedorService.criarFornecedor(this.fornecedor).subscribe(
      () => {
        Swal.fire('Fornecedor salvo com sucesso!', '', 'success');
        this.voltar(); // Retorna após salvar
      },
      (erro) => {
        Swal.fire('Erro ao salvar o fornecedor: ' + erro.error, 'error');
      }
    );
}

voltar(): void {
  this.router.navigate(['/fornecedor-listagem']);
}



}

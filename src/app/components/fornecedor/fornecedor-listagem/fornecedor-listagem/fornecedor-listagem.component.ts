import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { Router } from '@angular/router';
import { Fornecedor } from '../../../../shared/model/entity/fornecedor';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fornecedor-listagem',
  imports: [FormsModule, CommonModule],
  templateUrl: './fornecedor-listagem.component.html',
  styleUrl: './fornecedor-listagem.component.css'
})
export class FornecedorListagemComponent implements OnInit {


    private fornecedorService = inject(FornecedorService);
    private router = inject(Router);

    public Fornecedor = new Fornecedor();
    public fornecedores: Fornecedor[] = [];


    ngOnInit(): void {
      this.buscarFornecedores();
    }


    public buscarFornecedores() {
      this.fornecedorService.listarTodos().subscribe(
        (resultado) => {
          this.fornecedores = resultado;
          console.log(this.fornecedores);
        },
        (erro) => {
          console.error('Erro ao consultar todos os fornecedores', erro.error.mensagem);
        }
      );
    }

     excluir(fornecedorSelecionado: Fornecedor) {
        Swal.fire({
          title: 'Deseja realmente excluir o fornecedor?',
          text: 'Essa ação não poderá ser desfeita!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, excluir!',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.fornecedorService.excluirFornecedor(fornecedorSelecionado.id).subscribe(
              () => {
                this.fornecedores = this.fornecedores.filter(c => c.id !== fornecedorSelecionado.id);
                Swal.fire('Excluído!', 'O fornecedor foi removido com sucesso.', 'success');
              },
            );
          }
        });
      }

      editar(fornecedorSelecionado: Fornecedor){
        this.router.navigate(['/fornecedor-editar/', fornecedorSelecionado]);
      }

      public adicionarFornecedor() {
        this.router.navigate(['fornecedor-detalhe']);
      }
}

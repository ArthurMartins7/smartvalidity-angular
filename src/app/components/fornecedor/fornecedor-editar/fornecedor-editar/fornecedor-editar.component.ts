import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import Swal from 'sweetalert2';
import { Fornecedor } from '../../../../shared/model/entity/fornecedor';
import { Endereco } from '../../../../shared/model/entity/endereco';

@Component({
  selector: 'app-fornecedor-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './fornecedor-editar.component.html',
  styleUrls: ['./fornecedor-editar.component.css']
})
export class FornecedorEditarComponent implements OnInit {
  public fornecedor: Fornecedor = new Fornecedor();
  public secaoAtiva: 'dadosGerais' | 'endereco' = 'dadosGerais';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorService: FornecedorService
  ) {
    this.fornecedor.endereco = new Endereco();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.carregarFornecedor(id);
    }
  }

  carregarFornecedor(id: number): void {
    this.fornecedorService.buscarPorId(id).subscribe({
      next: (fornecedor: Fornecedor) => {
        this.fornecedor = fornecedor;
      },
      error: (error: any) => {
        console.error('Erro ao carregar fornecedor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao carregar os dados do fornecedor'
        });
      }
    });
  }

  atualizar(event: Event): void {
    event.preventDefault();

    this.fornecedorService.atualizarFornecedor(this.fornecedor.id!, this.fornecedor).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Fornecedor atualizado com sucesso!'
        }).then(() => {
          this.router.navigate(['/fornecedor-listagem']);
        });
      },
      error: (error: any) => {
        console.error('Erro ao atualizar fornecedor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao atualizar o fornecedor'
        });
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/fornecedor-listagem']);
  }
}

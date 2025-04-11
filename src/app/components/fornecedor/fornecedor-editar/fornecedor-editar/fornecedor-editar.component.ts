import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { CepService } from '../../../../shared/service/cep.service';
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
  public buscandoCep: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorService: FornecedorService,
    private cepService: CepService
  ) {
    this.fornecedor.endereco = new Endereco();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.carregarFornecedor(id);
    }
  }

  carregarFornecedor(id: string): void {
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

  /**
   * Busca o endereço a partir do CEP informado
   */
  buscarEnderecoPorCep(): void {
    const cep = this.fornecedor.endereco.cep;

    if (!cep || cep.length < 8) {
      return;
    }

    this.buscandoCep = true;

    this.cepService.consultarCep(cep).subscribe({
      next: (endereco) => {
        // Preenche os campos do endereço mantendo o CEP e número já digitados
        this.fornecedor.endereco.logradouro = endereco.logradouro;
        this.fornecedor.endereco.bairro = endereco.bairro;
        this.fornecedor.endereco.cidade = endereco.cidade;
        this.fornecedor.endereco.estado = endereco.estado;
        this.fornecedor.endereco.pais = endereco.pais;
        this.buscandoCep = false;

        Swal.fire({
          icon: 'success',
          title: 'Endereço encontrado',
          text: 'Os dados do endereço foram preenchidos automaticamente.',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.buscandoCep = false;

        Swal.fire({
          icon: 'error',
          title: 'Erro ao buscar CEP',
          text: 'Não foi possível encontrar o endereço para o CEP informado.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}

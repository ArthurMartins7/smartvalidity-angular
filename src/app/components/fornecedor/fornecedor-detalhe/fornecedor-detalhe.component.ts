import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FornecedorService } from '../../../shared/service/fornecedor.service';
import { CepService } from '../../../shared/service/cep.service';
import { Fornecedor } from '../../../shared/model/entity/fornecedor';
import { Endereco } from '../../../shared/model/entity/endereco';

@Component({
  selector: 'app-fornecedor-detalhe',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './fornecedor-detalhe.component.html',
  styleUrl: './fornecedor-detalhe.component.css'
})
export class FornecedorDetalheComponent implements OnInit {

  public fornecedor: Fornecedor = new Fornecedor();
  public idFornecedor: number;
  public secaoAtiva: 'dadosGerais' | 'endereco' = 'dadosGerais';
  public buscandoCep: boolean = false;

  constructor(private fornecedorService: FornecedorService,
              private cepService: CepService,
              private router: Router,
              private route: ActivatedRoute) {
    // Initialize endereco when creating a new Fornecedor
    this.fornecedor.endereco = new Endereco();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idFornecedor = params['id'];
      if (this.idFornecedor) {
        this.buscarFornecedor();
      }
    });
  }

  buscarFornecedor(): void {
    this.fornecedorService.buscarPorId(this.idFornecedor).subscribe(
      (fornecedor) => {
        this.fornecedor = fornecedor;
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
        this.voltar();
      },
      (erro) => {
        console.error('Erro completo:', erro);
        const mensagemErro = erro.error?.message || erro.message || 'Erro desconhecido ao salvar o fornecedor';
        Swal.fire('Erro!', mensagemErro, 'error');
      }
    );
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

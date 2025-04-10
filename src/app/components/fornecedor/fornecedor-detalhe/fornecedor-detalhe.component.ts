import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FornecedorService } from '../../../shared/service/fornecedor.service';
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

  constructor(private fornecedorService: FornecedorService,
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
}

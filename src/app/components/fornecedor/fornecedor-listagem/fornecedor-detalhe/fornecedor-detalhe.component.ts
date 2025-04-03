import { Component, OnInit } from '@angular/core';
import { FornecedorDTO } from '../../../../shared/model/dto/fornecedor.dto';
import { FornecedorService } from '../../../../shared/service/fornecedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { EnderecoDTO } from '../../../../shared/model/dto/endereco.dto';

@Component({
  selector: 'app-fornecedor-detalhe',
  imports: [FormsModule],
  templateUrl: './fornecedor-detalhe.component.html',
  styleUrl: './fornecedor-detalhe.component.css'
})
export class FornecedorDetalheComponent implements OnInit{

  public fornecedor: FornecedorDTO = new FornecedorDTO();
  public idFornecedor: number;

  constructor(private fornecedorService: FornecedorService,
    private router: Router,
    private route: ActivatedRoute
) {
    // Initialize endereco when creating a new Fornecedor
    this.fornecedor.endereco = new EnderecoDTO();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.idFornecedor = params['id'];
      if(this.idFornecedor) {
        this.buscarFornecedor();
      }
    });
  }

  private validarCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');

    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    let digito = 11 - (soma % 11);
    if (digito > 9) digito = 0;
    if (parseInt(cnpj.charAt(12)) !== digito) {
      return false;
    }

    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    digito = 11 - (soma % 11);
    if (digito > 9) digito = 0;
    if (parseInt(cnpj.charAt(13)) !== digito) {
      return false;
    }

    return true;
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

    if (!this.fornecedor.cnpj || !this.validarCNPJ(this.fornecedor.cnpj)) {
      Swal.fire({
        title: 'CNPJ Inválido',
        text: 'Por favor, insira um CNPJ válido',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

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
        if (erro.error?.message?.toLowerCase().includes('cnpj')) {
          Swal.fire('CNPJ Inválido', 'Por favor, verifique o CNPJ informado', 'error');
        } else {
          const mensagemErro = erro.error?.message || erro.message || 'Erro desconhecido ao salvar o fornecedor';
          Swal.fire('Erro!', mensagemErro, 'error');
        }
      }
    );
  }

  voltar(): void {
    this.router.navigate(['/fornecedor-listagem']);
  }
}

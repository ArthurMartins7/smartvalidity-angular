import { Component, OnInit } from '@angular/core';
import { Corredor } from '../../../shared/model/entity/corredor';
import { FormsModule } from '@angular/forms';
import { CorredorService } from '../../../shared/service/corredor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-corredor-detalhe',
  imports: [FormsModule],
  templateUrl: './corredor-detalhe.component.html',
  styleUrl: './corredor-detalhe.component.css'
})
export class CorredorDetalheComponent implements OnInit{

  public corredor: Corredor = new Corredor();
  public idCorredor: number;

  constructor(
    private corredorService: CorredorService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
  ){ }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  salvar(): void {
    if (this.corredor.nome && this.corredor.responsaveis) {
      if (this.idCorredor) {
        //this.alterar();
      } else {
        this.inserir();
      }
    } else {
      Swal.fire('Preencha todos os campos obrigatórios!', '', 'warning');
    }
  }

  public inserir(): void {
    this.corredorService.criarCorredor(this.corredor).subscribe(
      (resposta) => {
        this.corredor = resposta;
        Swal.fire('Corredor salvo com sucesso!', '', 'success');
        this.voltar();
      },
      (erro) => {
        Swal.fire('Erro ao salvar um corredor!', erro.error.mensagem, 'error');
      }
    );
  }



  public voltar() {
    this.router.navigate(['corredor'])
  }
}

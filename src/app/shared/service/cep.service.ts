import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Endereco } from '../model/entity/endereco';

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly API_VIACEP = 'https://viacep.com.br/ws';

  constructor(private httpClient: HttpClient) { }

  /**
   * Busca informações de endereço através do CEP utilizando a API ViaCEP
   * @param cep CEP para busca (somente números)
   * @returns Observable com os dados do endereço
   */
  consultarCep(cep: string): Observable<Endereco> {
    // Remove caracteres não numéricos
    cep = cep.replace(/\D/g, '');

    // Verifica se o CEP possui o formato correto
    if (cep.length !== 8) {
      throw new Error('CEP inválido');
    }

    // Faz a chamada para a API ViaCEP
    return this.httpClient.get<any>(`${this.API_VIACEP}/${cep}/json`)
      .pipe(
        map(resposta => {
          console.log('resposta: ' + resposta.pais)
          // Verifica se a resposta contém um erro
          if (resposta.erro) {
            throw new Error('CEP não encontrado');
          }

          // Converte a resposta para o formato Endereco
          const endereco = new Endereco();
          endereco.logradouro = resposta.logradouro;
          endereco.bairro = resposta.bairro;
          endereco.cidade = resposta.localidade;
          endereco.estado = resposta.uf;
          endereco.cep = cep;
          endereco.pais = 'Brasil';

          return endereco;
        })
      );
  }
}

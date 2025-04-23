import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Corredor } from '../model/entity/corredor';
import { CorredorSeletor } from '../model/seletor/corredor.seletor';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../model/entity/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class CorredorService {
  private readonly API = 'http://localhost:8080/smartvalidity/corredor';

  constructor(
    private httpClient: HttpClient,
    private usuarioService: UsuarioService
  ) { }

  uploadImagem(idCorredor: number, formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.API}/${idCorredor}/upload`, formData, { responseType: 'text' });
  }

  criarCorredor(novoCorredor: Corredor): Observable<Corredor> {
    return this.httpClient.post<Corredor>(this.API, novoCorredor);
  }

  listarTodos(): Observable<Array<Corredor>> {
    return this.httpClient.get<Array<Corredor>>(this.API);
  }

  buscarPorId(id: number): Observable<Corredor> {
    return this.httpClient.get<Corredor>(`${this.API}/${id}`);
  }

  listarComSeletor(seletor: CorredorSeletor): Observable<Corredor[]> {
    console.log('Enviando seletor para o backend:', {
      url: `${this.API}/filtro`,
      seletor: {
        nome: seletor.nome,
        responsavel: seletor.responsavel,
        responsavelId: seletor.responsavelId,
        pagina: seletor.pagina,
        limite: seletor.limite
      }
    });

    // Garantir que o responsavelId seja enviado como string
    const seletorEnviado = {
      ...seletor,
      responsavelId: seletor.responsavelId ? String(seletor.responsavelId) : null
    };

    return this.httpClient.post<Corredor[]>(`${this.API}/filtro`, seletorEnviado);
  }

  contarTotalRegistros(seletor: CorredorSeletor): Observable<number> {
    return this.httpClient.post<number>(`${this.API}/contar`, seletor);
  }

  listarResponsaveis(): Observable<Usuario[]> {
    return this.usuarioService.buscarTodos();
  }

  atualizarCorredor(id: number, corredorAtualizado: Corredor): Observable<Corredor> {
    return this.httpClient.put<Corredor>(`${this.API}/${id}`, corredorAtualizado);
  }

  excluirCorredor(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`);
  }
}

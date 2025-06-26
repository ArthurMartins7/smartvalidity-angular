import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Empresa } from "../model/entity/empresa";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private readonly API = 'http://localhost:8080/smartvalidity/empresa';

  private httpClient = inject(HttpClient);

  buscarPorId(id: string): Observable<Empresa> {
    return this.httpClient.get<Empresa>(`${this.API}/${id}`);
  }

}
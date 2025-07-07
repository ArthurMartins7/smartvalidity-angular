import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from '@env';
import { Observable } from "rxjs";
import { Empresa } from "../model/entity/empresa";

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  private readonly API = `${environment.apiUrl}/empresa`;

  private httpClient = inject(HttpClient);

  buscarPorId(id: string): Observable<Empresa> {
    return this.httpClient.get<Empresa>(`${this.API}/${id}`);
  }

}

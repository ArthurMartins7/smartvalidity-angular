import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MuralItem } from '../models/mural.model';

@Injectable({
  providedIn: 'root'
})
export class MuralService {
  private readonly API = 'http://localhost:8080/smartvalidity/mural';

  constructor(private httpClient: HttpClient) { }

  getProximosVencer(): Observable<MuralItem[]> {
    return this.httpClient.get<MuralItem[]>(`${this.API}/proximos-vencer`);
  }

  getVencemHoje(): Observable<MuralItem[]> {
    return this.httpClient.get<MuralItem[]>(`${this.API}/vencem-hoje`);
  }

  getVencidos(): Observable<MuralItem[]> {
    return this.httpClient.get<MuralItem[]>(`${this.API}/vencidos`);
  }
}

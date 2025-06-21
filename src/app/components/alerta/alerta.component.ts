import { Component } from '@angular/core';
import { AlertaListagemComponent } from './alerta-listagem/alerta-listagem.component';

@Component({
  selector: 'app-alerta',
  standalone: true,
  imports: [AlertaListagemComponent],
  templateUrl: './alerta.component.html',
  styleUrl: './alerta.component.css'
})
export class AlertaComponent {

}

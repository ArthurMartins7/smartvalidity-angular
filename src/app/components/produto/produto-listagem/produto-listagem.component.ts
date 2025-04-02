import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/ui/sidebar/sidebar.component';

@Component({
  selector: 'app-produto-listagem',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './produto-listagem.component.html',
  styleUrl: './produto-listagem.component.css'
})
export class ProdutoListagemComponent {

}

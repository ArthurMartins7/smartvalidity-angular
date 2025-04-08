import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entrada-estoque',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada-estoque.component.html',
  styleUrl: './entrada-estoque.component.css'
})
export class EntradaEstoqueComponent {
  formData = {
    produto: '',
    lote: '',
    quantidade: '',
    dataRecebimento: '',
    dataFabricacao: '',
    dataVencimento: ''
  };

  onSubmit() {
    console.log('Dados do formulário:', this.formData);
    // Aqui você implementará a lógica de salvamento
  }
}

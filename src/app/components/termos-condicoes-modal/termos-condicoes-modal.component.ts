import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-termos-condicoes-modal',
  templateUrl: './termos-condicoes-modal.component.html',
  styleUrls: ['./termos-condicoes-modal.component.css'],
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class TermosCondicoesModalComponent {
  constructor(public dialogRef: MatDialogRef<TermosCondicoesModalComponent>) {}
}

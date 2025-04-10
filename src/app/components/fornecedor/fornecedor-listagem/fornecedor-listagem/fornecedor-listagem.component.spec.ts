import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FornecedorListagemComponent } from './fornecedor-listagem.component';

describe('FornecedorListagemComponent', () => {
  let component: FornecedorListagemComponent;
  let fixture: ComponentFixture<FornecedorListagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FornecedorListagemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FornecedorListagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

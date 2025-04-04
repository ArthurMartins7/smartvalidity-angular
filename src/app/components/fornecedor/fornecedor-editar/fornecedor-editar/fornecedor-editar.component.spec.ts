import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FornecedorEditarComponent } from './fornecedor-editar.component';

describe('FornecedorEditarComponent', () => {
  let component: FornecedorEditarComponent;
  let fixture: ComponentFixture<FornecedorEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FornecedorEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FornecedorEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

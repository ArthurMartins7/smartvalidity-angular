import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaContaSenhaCodigoVerificacaoComponent } from './minha-conta-senha-codigo-verificacao.component';

describe('MinhaContaSenhaCodigoVerificacaoComponent', () => {
  let component: MinhaContaSenhaCodigoVerificacaoComponent;
  let fixture: ComponentFixture<MinhaContaSenhaCodigoVerificacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaContaSenhaCodigoVerificacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaContaSenhaCodigoVerificacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

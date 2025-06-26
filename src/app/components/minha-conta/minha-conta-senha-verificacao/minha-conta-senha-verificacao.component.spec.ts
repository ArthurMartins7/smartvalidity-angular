import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaContaSenhaVerificacaoComponent } from './minha-conta-senha-verificacao.component';

describe('MinhaContaSenhaVerificacaoComponent', () => {
  let component: MinhaContaSenhaVerificacaoComponent;
  let fixture: ComponentFixture<MinhaContaSenhaVerificacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaContaSenhaVerificacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaContaSenhaVerificacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

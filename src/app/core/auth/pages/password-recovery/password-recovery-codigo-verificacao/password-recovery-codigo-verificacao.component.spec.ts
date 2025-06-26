import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRecoveryCodigoVerificacaoComponent } from './password-recovery-codigo-verificacao.component';

describe('PasswordRecoveryCodigoVerificacaoComponent', () => {
  let component: PasswordRecoveryCodigoVerificacaoComponent;
  let fixture: ComponentFixture<PasswordRecoveryCodigoVerificacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryCodigoVerificacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryCodigoVerificacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

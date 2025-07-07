import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRecoveryAlterarSenhaComponent } from './password-recovery-alterar-senha.component';

describe('PasswordRecoveryAlterarSenhaComponent', () => {
  let component: PasswordRecoveryAlterarSenhaComponent;
  let fixture: ComponentFixture<PasswordRecoveryAlterarSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryAlterarSenhaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryAlterarSenhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

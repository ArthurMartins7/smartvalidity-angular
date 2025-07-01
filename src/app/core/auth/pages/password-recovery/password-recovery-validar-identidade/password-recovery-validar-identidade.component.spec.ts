import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRecoveryValidarIdentidadeComponent } from './password-recovery-validar-identidade.component';

describe('PasswordRecoveryValidarIdentidadeComponent', () => {
  let component: PasswordRecoveryValidarIdentidadeComponent;
  let fixture: ComponentFixture<PasswordRecoveryValidarIdentidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryValidarIdentidadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryValidarIdentidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

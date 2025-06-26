import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupVerificacaoComponent } from './signup-verificacao.component';

describe('SignupVerificacaoComponent', () => {
  let component: SignupVerificacaoComponent;
  let fixture: ComponentFixture<SignupVerificacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupVerificacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupVerificacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

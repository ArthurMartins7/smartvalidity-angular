import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupInfoPessoaisComponent } from './signup-info-pessoais.component';

describe('SignupInfoPessoaisComponent', () => {
  let component: SignupInfoPessoaisComponent;
  let fixture: ComponentFixture<SignupInfoPessoaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupInfoPessoaisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupInfoPessoaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

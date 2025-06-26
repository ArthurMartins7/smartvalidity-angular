import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSenhaComponent } from './signup-senha.component';

describe('SignupSenhaComponent', () => {
  let component: SignupSenhaComponent;
  let fixture: ComponentFixture<SignupSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupSenhaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupSenhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

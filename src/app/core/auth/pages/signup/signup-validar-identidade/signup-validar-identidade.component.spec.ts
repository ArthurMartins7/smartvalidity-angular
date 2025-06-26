import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupValidarIdentidadeComponent } from './signup-validar-identidade.component';

describe('SignupValidarIdentidadeComponent', () => {
  let component: SignupValidarIdentidadeComponent;
  let fixture: ComponentFixture<SignupValidarIdentidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupValidarIdentidadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupValidarIdentidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

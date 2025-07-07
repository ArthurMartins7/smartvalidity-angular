import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaContaSenhaValidarIdentidadeComponent } from './minha-conta-senha-validar-identidade.component';

describe('MinhaContaSenhaValidarIdentidadeComponent', () => {
  let component: MinhaContaSenhaValidarIdentidadeComponent;
  let fixture: ComponentFixture<MinhaContaSenhaValidarIdentidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaContaSenhaValidarIdentidadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaContaSenhaValidarIdentidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

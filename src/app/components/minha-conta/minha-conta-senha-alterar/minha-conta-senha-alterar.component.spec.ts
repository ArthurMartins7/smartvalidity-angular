import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaContaSenhaAlterarComponent } from './minha-conta-senha-alterar.component';

describe('MinhaContaSenhaAlterarComponent', () => {
  let component: MinhaContaSenhaAlterarComponent;
  let fixture: ComponentFixture<MinhaContaSenhaAlterarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaContaSenhaAlterarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaContaSenhaAlterarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

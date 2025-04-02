import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntradaEstoqueComponent } from './entrada-estoque.component';

describe('EntradaEstoqueComponent', () => {
  let component: EntradaEstoqueComponent;
  let fixture: ComponentFixture<EntradaEstoqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntradaEstoqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntradaEstoqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

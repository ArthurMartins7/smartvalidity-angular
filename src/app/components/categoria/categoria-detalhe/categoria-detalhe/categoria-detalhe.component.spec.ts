import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaDetalheComponent } from './categoria-detalhe.component';

describe('CategoriaDetalheComponent', () => {
  let component: CategoriaDetalheComponent;
  let fixture: ComponentFixture<CategoriaDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaDetalheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriaDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

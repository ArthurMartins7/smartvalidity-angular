import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorredorDetalheComponent } from './corredor-detalhe.component';

describe('CorredorDetalheComponent', () => {
  let component: CorredorDetalheComponent;
  let fixture: ComponentFixture<CorredorDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorredorDetalheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorredorDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuralDetalheComponent } from './mural-detalhe.component';

describe('MuralDetalheComponent', () => {
  let component: MuralDetalheComponent;
  let fixture: ComponentFixture<MuralDetalheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuralDetalheComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuralDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

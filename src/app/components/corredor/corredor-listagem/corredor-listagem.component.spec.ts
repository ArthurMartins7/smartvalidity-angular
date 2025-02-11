import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorredorListagemComponent } from './corredor-listagem.component';

describe('CorredorListagemComponent', () => {
  let component: CorredorListagemComponent;
  let fixture: ComponentFixture<CorredorListagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorredorListagemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorredorListagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

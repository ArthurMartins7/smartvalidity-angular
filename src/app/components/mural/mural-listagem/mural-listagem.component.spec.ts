import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuralListagemComponent } from './mural-listagem.component';

describe('MuralListagemComponent', () => {
  let component: MuralListagemComponent;
  let fixture: ComponentFixture<MuralListagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuralListagemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuralListagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

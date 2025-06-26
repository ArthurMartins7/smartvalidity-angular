import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosPerfisPendentesComponent } from './usuarios-perfis-pendentes.component';

describe('UsuariosPerfisPendentesComponent', () => {
  let component: UsuariosPerfisPendentesComponent;
  let fixture: ComponentFixture<UsuariosPerfisPendentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosPerfisPendentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosPerfisPendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

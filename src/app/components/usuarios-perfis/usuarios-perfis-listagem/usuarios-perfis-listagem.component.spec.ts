import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosPerfisListagemComponent } from './usuarios-perfis-listagem.component';

describe('UsuariosPerfisListagemComponent', () => {
  let component: UsuariosPerfisListagemComponent;
  let fixture: ComponentFixture<UsuariosPerfisListagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosPerfisListagemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosPerfisListagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

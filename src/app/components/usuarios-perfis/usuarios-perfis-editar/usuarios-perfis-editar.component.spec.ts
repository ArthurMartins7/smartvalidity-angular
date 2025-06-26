import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosPerfisEditarComponent } from './usuarios-perfis-editar.component';

describe('UsuariosPerfisEditarComponent', () => {
  let component: UsuariosPerfisEditarComponent;
  let fixture: ComponentFixture<UsuariosPerfisEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosPerfisEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosPerfisEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

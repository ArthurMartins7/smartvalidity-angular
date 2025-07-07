import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaContaEditarComponent } from './minha-conta-editar.component';

describe('MinhaContaEditarComponent', () => {
  let component: MinhaContaEditarComponent;
  let fixture: ComponentFixture<MinhaContaEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaContaEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaContaEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

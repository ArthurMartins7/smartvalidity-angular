import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorredorEditarComponent } from './corredor-editar.component';

describe('CorredorEditarComponent', () => {
  let component: CorredorEditarComponent;
  let fixture: ComponentFixture<CorredorEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorredorEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorredorEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

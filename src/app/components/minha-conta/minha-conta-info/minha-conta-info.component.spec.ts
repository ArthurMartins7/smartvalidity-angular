import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhaContaInfoComponent } from './minha-conta-info.component';

describe('MinhaContaInfoComponent', () => {
  let component: MinhaContaInfoComponent;
  let fixture: ComponentFixture<MinhaContaInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhaContaInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhaContaInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

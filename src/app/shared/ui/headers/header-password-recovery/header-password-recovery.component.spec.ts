import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPasswordRecoveryComponent } from './header-password-recovery.component';

describe('HeaderPasswordRecoveryComponent', () => {
  let component: HeaderPasswordRecoveryComponent;
  let fixture: ComponentFixture<HeaderPasswordRecoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderPasswordRecoveryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderPasswordRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

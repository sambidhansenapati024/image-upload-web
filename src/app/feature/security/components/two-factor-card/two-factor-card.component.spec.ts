import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorCardComponent } from './two-factor-card.component';

describe('TwoFactorCardComponent', () => {
  let component: TwoFactorCardComponent;
  let fixture: ComponentFixture<TwoFactorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFactorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

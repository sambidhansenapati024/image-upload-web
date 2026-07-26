import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesCardComponent } from './preferences-card.component';

describe('PreferencesCardComponent', () => {
  let component: PreferencesCardComponent;
  let fixture: ComponentFixture<PreferencesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

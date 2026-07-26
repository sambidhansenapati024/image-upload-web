import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSessionsCardComponent } from './active-sessions-card.component';

describe('ActiveSessionsCardComponent', () => {
  let component: ActiveSessionsCardComponent;
  let fixture: ComponentFixture<ActiveSessionsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveSessionsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveSessionsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

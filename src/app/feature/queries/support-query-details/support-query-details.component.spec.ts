import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportQueryDetailsComponent } from './support-query-details.component';

describe('SupportQueryDetailsComponent', () => {
  let component: SupportQueryDetailsComponent;
  let fixture: ComponentFixture<SupportQueryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportQueryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportQueryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

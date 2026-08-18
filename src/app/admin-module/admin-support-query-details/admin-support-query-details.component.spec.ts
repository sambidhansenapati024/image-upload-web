import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSupportQueryDetailsComponent } from './admin-support-query-details.component';

describe('AdminSupportQueryDetailsComponent', () => {
  let component: AdminSupportQueryDetailsComponent;
  let fixture: ComponentFixture<AdminSupportQueryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSupportQueryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSupportQueryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSupportQueriesComponent } from './admin-support-queries.component';

describe('AdminSupportQueriesComponent', () => {
  let component: AdminSupportQueriesComponent;
  let fixture: ComponentFixture<AdminSupportQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSupportQueriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSupportQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

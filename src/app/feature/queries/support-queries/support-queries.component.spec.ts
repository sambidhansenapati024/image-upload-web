import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportQueriesComponent } from './support-queries.component';

describe('SupportQueriesComponent', () => {
  let component: SupportQueriesComponent;
  let fixture: ComponentFixture<SupportQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportQueriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageStatsCardComponent } from './storage-stats-card.component';

describe('StorageStatsCardComponent', () => {
  let component: StorageStatsCardComponent;
  let fixture: ComponentFixture<StorageStatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageStatsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageStatsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

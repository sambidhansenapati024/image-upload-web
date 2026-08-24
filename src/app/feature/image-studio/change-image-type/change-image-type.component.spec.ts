import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeImageTypeComponent } from './change-image-type.component';

describe('ChangeImageTypeComponent', () => {
  let component: ChangeImageTypeComponent;
  let fixture: ComponentFixture<ChangeImageTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeImageTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeImageTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

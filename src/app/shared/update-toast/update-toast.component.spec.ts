import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateToastComponent } from './update-toast.component';

describe('UpdateToastComponent', () => {
  let component: UpdateToastComponent;
  let fixture: ComponentFixture<UpdateToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

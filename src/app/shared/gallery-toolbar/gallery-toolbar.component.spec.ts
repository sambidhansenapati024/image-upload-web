import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryToolbarComponent } from './gallery-toolbar.component';

describe('GalleryToolbarComponent', () => {
  let component: GalleryToolbarComponent;
  let fixture: ComponentFixture<GalleryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsTocComponent } from './docs-toc.component';

describe('DocsTocComponent', () => {
  let component: DocsTocComponent;
  let fixture: ComponentFixture<DocsTocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocsTocComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocsTocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

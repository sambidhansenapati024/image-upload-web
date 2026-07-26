import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsSidebarComponent } from './docs-sidebar.component';

describe('DocsSidebarComponent', () => {
  let component: DocsSidebarComponent;
  let fixture: ComponentFixture<DocsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocsSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

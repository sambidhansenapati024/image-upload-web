import { TestBed } from '@angular/core/testing';

import { BackgroundRemovalService } from './background-removal.service';

describe('BackgroundRemovalService', () => {
  let service: BackgroundRemovalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackgroundRemovalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

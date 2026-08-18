import { TestBed } from '@angular/core/testing';

import { SupportQueryService } from './support-query.service';

describe('SupportQueryService', () => {
  let service: SupportQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupportQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

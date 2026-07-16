import { TestBed } from '@angular/core/testing';

import { VersionServiceService } from './version-service.service';

describe('VersionServiceService', () => {
  let service: VersionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

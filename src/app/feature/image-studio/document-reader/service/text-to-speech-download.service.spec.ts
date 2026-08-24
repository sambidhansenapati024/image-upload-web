import { TestBed } from '@angular/core/testing';

import { TextToSpeechDownloadService } from './text-to-speech-download.service';

describe('TextToSpeechDownloadService', () => {
  let service: TextToSpeechDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextToSpeechDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

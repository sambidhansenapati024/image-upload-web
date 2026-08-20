import { TestBed } from '@angular/core/testing';

import { TextToSpeechServiceService } from './text-to-speech.service.service';

describe('TextToSpeechServiceService', () => {
  let service: TextToSpeechServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextToSpeechServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

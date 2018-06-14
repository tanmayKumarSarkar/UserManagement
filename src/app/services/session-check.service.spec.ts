import { TestBed, inject } from '@angular/core/testing';

import { SessionCheckService } from './session-check.service';

describe('SessionCheckService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionCheckService]
    });
  });

  it('should be created', inject([SessionCheckService], (service: SessionCheckService) => {
    expect(service).toBeTruthy();
  }));
});

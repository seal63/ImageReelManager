import { TestBed } from '@angular/core/testing';

import { ReelManagerService } from './reel-manager.service';

describe('ReelManagerService', () => {
  let service: ReelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AngularResourceService } from './angular-resource.service';

describe('AngularResourceService', () => {
  let service: AngularResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

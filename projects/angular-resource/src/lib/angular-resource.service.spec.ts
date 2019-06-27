import { TestBed } from '@angular/core/testing';

import { AngularResourceService } from './angular-resource.service';

describe('AngularResourceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AngularResourceService = TestBed.get(AngularResourceService);
    expect(service).toBeTruthy();
  });
});

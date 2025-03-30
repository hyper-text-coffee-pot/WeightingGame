import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { unauthorizedRedirectGuard } from './unauthorized-redirect.guard';

describe('unauthorizedRedirectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => unauthorizedRedirectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

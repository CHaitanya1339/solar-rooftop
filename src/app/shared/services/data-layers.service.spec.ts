import { TestBed } from '@angular/core/testing';

import { DataLayersService } from './data-layers.service';

describe('DataLayersService', () => {
  let service: DataLayersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataLayersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

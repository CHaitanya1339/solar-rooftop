import { TestBed } from '@angular/core/testing';

import { GeoTiffService } from './geo-tiff.service';

describe('GeoTiffService', () => {
  let service: GeoTiffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoTiffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

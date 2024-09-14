import { TestBed } from '@angular/core/testing';

import { BuildingInsightsService } from './building-insights.service';

describe('BuildingInsightsService', () => {
  let service: BuildingInsightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildingInsightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

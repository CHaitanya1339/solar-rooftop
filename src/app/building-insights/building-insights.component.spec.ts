import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingInsightsComponent } from './building-insights.component';

describe('BuildingInsightsComponent', () => {
  let component: BuildingInsightsComponent;
  let fixture: ComponentFixture<BuildingInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingInsightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, Input, OnInit } from '@angular/core';
import { BuildingInsightsResponse, RequestError, SolarPanelConfig } from '../shared/interfaces/solar.interface';
import { BuildingInsightsService } from '../shared/services/building-insights.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { createPalette, normalize, rgbToColor } from './../shared/utils/visualize';
import { panelsPalette } from './../shared/utils/colors';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { HlmH2Directive } from '@spartan-ng/ui-typography-helm';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';


import 'chartjs-plugin-annotation';

import {
  HlmCaptionComponent,
  HlmTableComponent,
  HlmTdComponent,
  HlmThComponent,
  HlmTrowComponent,
} from '@spartan-ng/ui-table-helm';
import { Router } from '@angular/router';



@Component({
  selector: 'app-building-insights',
  standalone: true,
  imports: [JsonPipe, CommonModule, FormsModule, SliderModule, HlmH2Directive,  HlmCaptionComponent,
    HlmTableComponent,
    HlmTdComponent,
    HlmThComponent,
    HlmTrowComponent, ChartModule],
  templateUrl: './building-insights.component.html',
  styleUrl: './building-insights.component.scss'
})
export class BuildingInsightsComponent implements OnInit {
  expandedSection!: string;
  buildingInsights!: BuildingInsightsResponse | any;
  configId!: number;
  panelCapacityWatts!: number;
  showPanels  = true;
  showLoader = true;
  @Input('googleMapsApiKey') googleMapsApiKey!: string;
  @Input('geometryLibrary') geometryLibrary!: google.maps.GeometryLibrary;
  @Input('location') location!: google.maps.LatLng;
  @Input('map') map!: google.maps.Map;
  data: any;
  options: any;

  icon = 'home';
  title = 'Building Insights endpoint';

  requestSent = false;
  requestError: RequestError | undefined;

  panelConfig: SolarPanelConfig | any;

  // Config Id base value
  defaultPanelCapacity!: number;
  panelCapacityRatio!: number;
  solarIncentives: number = 7000;
  installationCostPerWatt: number = 3.5;
  // User settings
  monthlyAverageEnergyBillInput = 300;
  panelCapacityWattsInput = 250;
  energyCostPerKwhInput = 0.31;
  dcToAcDerateInput = 0.85;
  // Slider settings
  panelCount: number = 31; // Default value for the slider
  yearlyEnergyDcKwh = 12000;
  efficiencyDepreciationFactor = 0.995;
  installationLifeSpan = 20;
  costIncreaseFactor = 1.022;
  discountRate = 1.04;
  // Find the config that covers the yearly energy consumption.
  yearlyKwhEnergyConsumption!: number;
  installationSizeKw!: number;
  installationCostTotal!: number;
  yearlyEnergy!: number;
  initialAcKwhPerYear!: number;
  yearlyProductionAcKwh!: number[];
  yearlyUtilityBillEstimates!: number[];
  remainingLifetimeUtilityBill!: number;
  totalCostWithSolar!: number;
  totalCostWithoutSolar!: number;
  yearlyCostWithoutSolar!: number[];
  showErrorLayer: boolean = false;

  constructor(private buildingInsightsService: BuildingInsightsService, private route: Router) { }

  ngOnInit() {
    // Automatically call the function to set panels when the component initializes
    this.setSolarPanels();
     this.data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Cost with Solar',
          data: [80, 75, 70, 65, 60, 55, 50, 55, 60, 65, 70, 75],
          fill: false,
          borderColor: '#4bc0c0'
        },
        {
          label: 'Cost without Solar',
          data: [100, 105, 110, 115, 120, 125, 130, 135, 130, 125, 120, 115],
          fill: false,
          borderColor: '#565656'
        }
      ]
    };

    this.options = {
      responsive: true,
      title: {
        display: true,
        text: 'Monthly Energy Costs: Solar vs Non-Solar'
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cost ($)'
          },
          suggestedMin: 0,
          suggestedMax: 150
        }
      }
    };



  }

  ngOnChanges() {
    if (this.location) {
      this.buildingInsightsService.findClosestBuilding(this.location, this.googleMapsApiKey).subscribe(res => {
        this.buildingInsights = res;
        this.showLoader = false;
        if (!this.configId) {
          this.showErrorLayer = false;
          console.log(this.panelCount);
          console.log(this.panelCapacityWatts);
          this.installationSizeKw = this.panelCount * this.panelCapacityWattsInput / 1000;
          this.installationCostTotal = this.installationCostPerWatt * this.installationSizeKw * 1000;
          console.log("Installation size",this.installationSizeKw);
          console.log("Installation cost",this.installationCostTotal);
          this.defaultPanelCapacity = this.buildingInsights.solarPotential.panelCapacityWatts;
          this.yearlyKwhEnergyConsumption = (this.monthlyAverageEnergyBillInput / this.energyCostPerKwhInput) * 12;
          console.log("Yearly Energy",this.yearlyKwhEnergyConsumption);
          this.panelCapacityRatio = this.panelCapacityWattsInput / this.defaultPanelCapacity;
          this.configId = this.findSolarConfig(this.buildingInsights.solarPotential.solarPanelConfigs, this.yearlyKwhEnergyConsumption, this.panelCapacityRatio, this.dcToAcDerateInput);
          this.yearlyEnergy = (this.buildingInsights.solarPotential.solarPanelConfigs[this.configId]?.yearlyEnergyDcKwh ?? 0) * this.panelCapacityRatio;
          this.setPanelConfig(this.configId);
          console.log(this.configId);
          this.initialAcKwhPerYear = this.yearlyEnergyDcKwh * this.dcToAcDerateInput;
          this.yearlyProductionAcKwh = [...Array(this.installationLifeSpan).keys()].map(
            (year) => this.initialAcKwhPerYear * this.efficiencyDepreciationFactor ** year
          );
          this.yearlyUtilityBillEstimates = this.yearlyProductionAcKwh.map(
            (yearlyKwhEnergyProduced, year) => {
              const billEnergyKwh = this.yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
              const billEstimate = (billEnergyKwh * this.energyCostPerKwhInput * this.costIncreaseFactor ** year) / this.discountRate ** year;
              return Math.max(billEstimate, 0);
            }
          )

          this.remainingLifetimeUtilityBill = this.yearlyUtilityBillEstimates.reduce((x, y) => x + y, 0);
          this.totalCostWithSolar = this.installationCostTotal + this.remainingLifetimeUtilityBill - this.solarIncentives;
          this.yearlyCostWithoutSolar = [...Array(this.installationLifeSpan).keys()].map(
            (year) =>
            (this.monthlyAverageEnergyBillInput * 12 * this.costIncreaseFactor ** year) / this.discountRate ** year,
          );
          this.totalCostWithoutSolar = this.yearlyCostWithoutSolar.reduce((x, y) => x + y, 0);
          console.log("Total Cost with solar",this.totalCostWithSolar);
          console.log("Total cost without solar", this.totalCostWithoutSolar);

          this.setSolarPanels();
        }
      }, err => {
        console.error('GET buildingInsights error\n', err);
        this.showErrorLayer = true;
        this.showLoader = false;
        this.requestError = err.error;
      });
    }
  }

  updateCalculations() {
    if (this.location) {
      this.buildingInsightsService.findClosestBuilding(this.location, this.googleMapsApiKey).subscribe(res => {
        this.buildingInsights = res;
        console.log(this.buildingInsights);
        console.log(this.configId);
          console.log("inside it");

          this.installationSizeKw = this.panelCount * this.panelCapacityWattsInput / 1000;
          console.log("Installation Size", this.installationSizeKw);
          this.installationCostTotal = this.installationCostPerWatt * this.installationSizeKw * 1000;
          console.log("Installation Cost", this.installationCostTotal);
          this.yearlyKwhEnergyConsumption = (this.monthlyAverageEnergyBillInput / this.energyCostPerKwhInput) * 12;
          console.log("MonthlyBill",this.monthlyAverageEnergyBillInput)
          console.log("Yearly Energy",this.yearlyKwhEnergyConsumption);
          this.defaultPanelCapacity = this.buildingInsights.solarPotential.panelCapacityWatts;
          this.panelCapacityRatio = this.panelCapacityWattsInput / this.defaultPanelCapacity;

            this.configId = this.findSolarConfig(this.buildingInsights.solarPotential.solarPanelConfigs, this.yearlyKwhEnergyConsumption, this.panelCapacityRatio, this.dcToAcDerateInput);
          // this.setPanelConfig(this.configId);
          // console.log(this.configId);
          this.yearlyEnergy = (this.buildingInsights.solarPotential.solarPanelConfigs[this.configId]?.yearlyEnergyDcKwh ?? 0) * this.panelCapacityRatio;
          this.panelCount = this.buildingInsights.solarPotential.solarPanelConfigs[this.configId].panelsCount;
          this.initialAcKwhPerYear = this.yearlyEnergyDcKwh * this.dcToAcDerateInput;
          this.yearlyProductionAcKwh = [...Array(this.installationLifeSpan).keys()].map(
            (year) => this.initialAcKwhPerYear * this.efficiencyDepreciationFactor ** year
          );
          this.yearlyUtilityBillEstimates = this.yearlyProductionAcKwh.map(
            (yearlyKwhEnergyProduced, year) => {
              const billEnergyKwh = this.yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
              const billEstimate = (billEnergyKwh * this.energyCostPerKwhInput * this.costIncreaseFactor ** year) / this.discountRate ** year;
              return Math.max(billEstimate, 0);
            }
          )
          this.yearlyCostWithoutSolar = [...Array(this.installationLifeSpan).keys()].map(
            (year) =>
              (this.monthlyAverageEnergyBillInput * 12 * this.costIncreaseFactor ** year) / this.discountRate ** year,
          );
          this.totalCostWithoutSolar = this.yearlyCostWithoutSolar.reduce((x, y) => x + y, 0);
          this.remainingLifetimeUtilityBill = this.yearlyUtilityBillEstimates.reduce((x, y) => x + y, 0);
          console.log("Installation cost", this.installationCostTotal);
          console.log("Remaining Life time utility bill", this.remainingLifetimeUtilityBill);
          console.log("Solar Incentives", this.solarIncentives);
          this.totalCostWithSolar = this.installationCostTotal + this.remainingLifetimeUtilityBill - this.solarIncentives;
          this.yearlyCostWithoutSolar = [...Array(this.installationLifeSpan).keys()].map(
            (year) =>
            (this.monthlyAverageEnergyBillInput * 12 * this.costIncreaseFactor ** year) / this.discountRate ** year,
          );
          this.totalCostWithoutSolar = this.yearlyCostWithoutSolar.reduce((x, y) => x + y, 0);
          console.log("Total Cost with solar after",this.totalCostWithSolar);
          console.log("Total cost without solar after", this.totalCostWithoutSolar);
          // Automatically set panels after getting the response
          this.setSolarPanels();
      }, err => {
        console.error('GET buildingInsights error\n', err);
        this.requestError = err.error;
      });
    }
    this.setSolarPanels();
  }

  goBack() {
    window.location.reload();
  }

  findSolarConfig(solarPanelConfigs: SolarPanelConfig[], yearlyKwhEnergyConsumption: number, panelCapacityRatio: number, dcToAcDerateInput: number) {
    return solarPanelConfigs.findIndex(
      (config) =>
        config.yearlyEnergyDcKwh * panelCapacityRatio * dcToAcDerateInput >= yearlyKwhEnergyConsumption,
    );
  }

  setPanelConfig(configId: number) {
    this.configId = configId;
    this.panelConfig = this.buildingInsights.solarPotential.solarPanelConfigs[this.configId];
  }


  setSolarPanels() {
    if (!this.buildingInsights || !this.buildingInsights.solarPotential) return;

    // Clear any existing panels from the map
    this.solarPanels.forEach((panel) => panel.setMap(null));
    this.solarPanels = [];

    const solarPotential = this.buildingInsights.solarPotential;
    const palette = createPalette(panelsPalette).map(rgbToColor);
    const minEnergy = solarPotential.solarPanels.slice(-1)[0].yearlyEnergyDcKwh;
    const maxEnergy = solarPotential.solarPanels[0].yearlyEnergyDcKwh;

    // Create solar panels based on the slider value (panelCount)
    this.solarPanels = solarPotential.solarPanels.slice(0, this.panelCount).map((panel: any) => {
      const [w, h] = [solarPotential.panelWidthMeters / 2, solarPotential.panelHeightMeters / 2];
      const points = [
        { x: +w, y: +h }, // top right
        { x: +w, y: -h }, // bottom right
        { x: -w, y: -h }, // bottom left
        { x: -w, y: +h }, // top left
        { x: +w, y: +h }, // top right again to close the polygon
      ];

      const orientation = panel.orientation === 'PORTRAIT' ? 90 : 0;
      const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex].azimuthDegrees;
      const colorIndex = Math.round(normalize(panel.yearlyEnergyDcKwh, maxEnergy, minEnergy) * 255);

      return new google.maps.Polygon({
        paths: points.map(({ x, y }) =>
          this.geometryLibrary.spherical.computeOffset(
            { lat: panel.center.latitude, lng: panel.center.longitude },
            Math.sqrt(x * x + y * y),
            Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth,
          ),
        ),
        strokeColor: '#B0BEC5',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: palette[colorIndex],
        fillOpacity: 0.9,
      });
    });

    // Add the newly created solar panels to the map based on the slider's value
    this.solarPanels.forEach((panel, i) => {
      if (this.showPanels && this.panelConfig && i < this.panelCount) {
        panel.setMap(this.map);
      }
    });
  }

  solarPanels: google.maps.Polygon[] = [];
}

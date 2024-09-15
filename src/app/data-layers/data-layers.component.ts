import { Component, Input } from '@angular/core';

import { DataLayersService } from './../shared/services/data-layers.service';
import { DataLayersResponse, LayerId, RequestError } from '../shared/interfaces/solar.interface';
import { Layer } from '../shared/interfaces/layers.interface';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-data-layers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-layers.component.html',
  styleUrl: './data-layers.component.scss'
})
export class DataLayersComponent {
  @Input('map') map!: google.maps.Map;
  icon = 'layers';
  title = 'Data Layers endpoint';

  dataLayerOptions: Record<LayerId | 'none', string> = {
    none: 'No layer',
    mask: 'Roof mask',
    dsm: 'Digital Surface Model',
    rgb: 'Aerial image',
    annualFlux: 'Annual sunshine',
    monthlyFlux: 'Monthly sunshine',
    hourlyShade: 'Hourly shade',
  };

  monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  dataLayersResponse!: DataLayersResponse;
  requestError!: RequestError;
  // apiResponseDialog!: MdDialog;
  layerId: LayerId | 'none' = 'monthlyFlux';
  layer!: Layer;
  imageryQuality!: 'HIGH' | 'MEDIUM' | 'LOW';

  playAnimation = true;
  tick = 0;
  month = 0;
  day = 14;
  hour = 0;

  overlays: google.maps.GroundOverlay[] = [];
  showRoofOnly = false;

  constructor(private dataLayersService: DataLayersService) { }

  setMapOverlay() {
    if (this.layer?.id == 'monthlyFlux') {
      this.overlays.map((overlay, i) => overlay.setMap(i == this.month ? this.map : null));
    } else if (this.layer?.id == 'hourlyShade') {
      this.overlays.map((overlay, i) => overlay.setMap(i == this.hour ? this.map : null));
    }
  }

  onSliderChange(event: Event) {
    const target: any = event.target; // as MdSlider
    if (this.layer?.id == 'monthlyFlux') {
      if (target.valueStart != this.month) {
        this.month = target.valueStart ?? 0;
      } else if (target.valueEnd != this.month) {
        this.month = target.valueEnd ?? 0;
      }
      this.tick = this.month;
    } else if (this.layer?.id == 'hourlyShade') {
      if (target.valueStart != this.hour) {
        this.hour = target.valueStart ?? 0;
      } else if (target.valueEnd != this.hour) {
        this.hour = target.valueEnd ?? 0;
      }
      this.tick = this.hour;
    }
  }

  onMonthlyOrHourly() {
    if (this.layer?.id == 'monthlyFlux') {
      if (this.playAnimation) {
        this.month = this.tick % 12;
      } else {
        this.tick = this.month;
      }
    } else if (this.layer?.id == 'hourlyShade') {
      if (this.playAnimation) {
        this.hour = this.tick % 24;
      } else {
        this.tick = this.hour;
      }
    }
  }

  showDataLayer() {

  }
  selectedLayer: string = 'no-layer';
  monthValue: number = 1;
  hourValue: number = 0;

  layerOptions = [
    { value: 'no-layer', label: 'No layer' },
    { value: 'roof-mask', label: 'Roof mask' },
    { value: 'dsm', label: 'Digital Surface Model' },
    { value: 'aerial-image', label: 'Aerial image' },
    { value: 'annual-sunshine', label: 'Annual sunshine' },
    { value: 'monthly-sunshine', label: 'Monthly sunshine' },
    { value: 'hourly-shade', label: 'Hourly shade' }
  ];

  onLayerChange(event: Event): void {
    this.selectedLayer = (event.target as HTMLSelectElement).value;
  }

  onMonthChange(event: Event): void {
    this.monthValue = parseInt((event.target as HTMLInputElement).value);
  }

  onHourChange(event: Event): void {
    
}
}

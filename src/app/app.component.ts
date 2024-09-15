import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { ButtonModule } from 'primeng/button';
import { PrimeNGConfig } from 'primeng/api';
import { SearchBarComponent } from './shared/components/search-bar/search-bar.component';
import { Loader } from '@googlemaps/js-api-loader';
import { BuildingInsightsResponse } from './shared/interfaces/solar.interface';
import { BuildingInsightsComponent } from './building-insights/building-insights.component';
import { HlmH1Directive } from '@spartan-ng/ui-typography-helm';
import { CommonModule } from '@angular/common';
import { DataLayersComponent } from "./data-layers/data-layers.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoogleMap, ButtonModule, SearchBarComponent, BuildingInsightsComponent, HlmH1Directive, CommonModule, DataLayersComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'solar-roof-estimator';
  googleMapsApiKey = 'AIzaSyBgBzxUb1STGGRI4gMGooODJYRVG_yUK9o';  // Don't expose the API key like this in production!
  defaultPlace = {
    name: 'Rinconada Library',
    address: '1213 Newell Rd, Palo Alto, CA 94303',
  };

  location!: google.maps.LatLng;  // Two-way bound location
  zoom = 19;

  @ViewChild('mapElement') mapElement!: ElementRef;
  geometryLibrary!: google.maps.GeometryLibrary | any;
  mapsLibrary!: google.maps.MapsLibrary | any;
  placesLibrary!: google.maps.PlacesLibrary | any;
  buildingInsights!: BuildingInsightsResponse | any;
  
  map!: google.maps.Map;

  constructor(private primengConfig: PrimeNGConfig, private renderer: Renderer2) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.loadGoogleMaps();
    this.renderer.addClass(document.body, 'dark');
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
    this.hourValue = parseInt((event.target as HTMLInputElement).value);
  }
  // Load Google Maps with required libraries
  loadGoogleMaps() {
    const loader = new Loader({
      apiKey: this.googleMapsApiKey,
      version: 'weekly',
    });

    const libraries = {
      geometry: loader.importLibrary('geometry'),
      maps: loader.importLibrary('maps'),
      places: loader.importLibrary('places'),
    };

    // Load the Google Maps libraries and set the default location
    Promise.all(Object.values(libraries)).then(([geometry, maps, places]) => {
      this.geometryLibrary = geometry;
      this.mapsLibrary = maps;
      this.placesLibrary = places;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this.defaultPlace.address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          const geocoderResult = results[0];
          this.location = geocoderResult.geometry.location;
          
          // Initialize the map at the default location
          this.map = new google.maps.Map(this.mapElement.nativeElement, {
            center: this.location,
            zoom: this.zoom,
            mapTypeId: 'satellite',
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            tilt: 0
          });
        }
      });
    });
  }

  // Handle location change event from SearchBarComponent
  onLocationChange(newLocation: google.maps.LatLng) {
    console.log("Location changed to: ", newLocation.lat(), newLocation.lng());
    this.location = newLocation;
  }
}
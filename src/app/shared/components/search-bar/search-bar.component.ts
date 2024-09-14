import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [GoogleMap, AutoCompleteModule, FormsModule, InputTextModule, HlmInputDirective],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements AfterViewInit {
  @Input('initialValue') initialValue!: string;
  @Input('map') map!: google.maps.Map;
  @Input('zoom') zoom!: number;
  @ViewChild('textFieldElement') textFieldElement!: ElementRef;

  @Output() locationChange = new EventEmitter<google.maps.LatLng>(); 

  autocomplete!: google.maps.places.Autocomplete;

  ngAfterViewInit() {
    this.autocomplete = new google.maps.places.Autocomplete(this.textFieldElement.nativeElement, {
      fields: ['formatted_address', 'geometry', 'name'],
    });
    this.autocomplete.addListener('place_changed', async () => {
      const place: google.maps.places.PlaceResult = this.autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        this.textFieldElement.nativeElement.value = '';
        return;
      }

      // Update map location
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(this.zoom);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(this.zoom);
      }

      // Emit the location change
      this.locationChange.emit(place.geometry.location);  // Emit the new location
    });
  }
}
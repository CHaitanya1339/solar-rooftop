import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BuildingInsightsResponse } from '../interfaces/solar.interface';

@Injectable({
  providedIn: 'root'
})
export class BuildingInsightsService {

  constructor(private http: HttpClient) { }

  findClosestBuilding(location: google.maps.LatLng, googleMapsApiKey: string) {
    const args = {
      'location.latitude': location.lat().toFixed(5),
      'location.longitude': location.lng().toFixed(5),
    };
    const params = new URLSearchParams({ ...args, key: googleMapsApiKey });

    return this.http.get<BuildingInsightsResponse>(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`);
  }
}

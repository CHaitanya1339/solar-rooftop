import { Injectable } from '@angular/core';
import { DataLayersResponse, LatLng } from '../interfaces/solar.interface';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DataLayersService {

  constructor(private http: HttpClient) { }

  // [START solar_api_data_layers]
  /**
   * Fetches the data layers information from the Solar API.
   *   https://developers.google.com/maps/documentation/solar/data-layers
   *
   * @param  {LatLng} location      Point of interest as latitude longitude.
   * @param  {number} radiusMeters  Radius of the data layer size in meters.
   * @param  {string} apiKey        Google Cloud API key.
   * @return {Promise<DataLayersResponse>}  Data Layers response.
   */
  getDataLayerUrls(location: LatLng, radiusMeters: number, apiKey: string) {
    const args = {
      'location.latitude': location.latitude.toFixed(5),
      'location.longitude': location.longitude.toFixed(5),
      radius_meters: radiusMeters.toString(),
      // The Solar API always returns the highest quality imagery available.
      // By default the API asks for HIGH quality, which means that HIGH quality isn't available,
      // but there is an existing MEDIUM or LOW quality, it won't return anything.
      // Here we ask for *at least* LOW quality, but if there's a higher quality available,
      // the Solar API will return us the highest quality available.
      required_quality: 'LOW',
    };
    console.log('GET dataLayers\n', args);
    const params = new URLSearchParams({ ...args, key: apiKey });
    return this.http.get(`https://solar.googleapis.com/v1/dataLayers:get?${params}`);
  }
}

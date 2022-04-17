import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { dsv } from 'd3'
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  static readonly API_HOST_NAME = "https://5sloc23ke4.execute-api.us-east-1.amazonaws.com/dev"

  // If data is emitted before subscribing, ReplySubject will re-emit the data
  private _powerPlantData: ReplaySubject<any> = new ReplaySubject();
  powerPlantData$ = this._powerPlantData.asObservable();

  private _fuelFilter: ReplaySubject<Array<string>> = new ReplaySubject();
  fuelFilter$ = this._fuelFilter.asObservable();

  private _selectedPowerPlant: ReplaySubject<any> = new ReplaySubject();
  selectedPowerPlant$ = this._selectedPowerPlant.asObservable();

  allFuels: Set<string>;

  constructor(private _httpClient : HttpClient) {}

  loadPowerPlantData() {
    dsv(",", "./dataset/us_powerplants.csv",
      function (d) {
        return {
          // Define how data will be formatted
          Name: d["name"],
          capacity_mw: +d["capacity_mw"]!,
          latitude: +d["latitude"]!,
          longitude: +d["longitude"]!,
          primary_fuel: d["primary_fuel"],
          commissioning_year: d["commissioning_year"],
          Owner: d["owner"],
      }
    }).then((data) => {
      // Emit to subscribers the data
      this._powerPlantData.next(data);
      this.getFuelTypes(data);
    });

    // Return obserable in case it is wanted
    return this.powerPlantData$;
  }

  getFuelTypes(powerPlantData: any) {
    let fuelTypeSet = new Set<string>();
    // Gets all fuel names
    for(let powerPlant of powerPlantData) {
      // Fuel names can be in multiple columns in data
      for(let propertyWithFuelName of ["primary_fuel", "other_fuel1", "other_fuel2", "other_fuel3"]) {
        let fuelName = powerPlant[propertyWithFuelName];
        if(fuelName != null && fuelName != "") {
          fuelTypeSet.add(fuelName);
        }
      }
    }
    this.allFuels = fuelTypeSet;
  }

  selectPowerPlant(powerPlant: any) {
    this._selectedPowerPlant.next(powerPlant);
  }

  setFuelFilter(fuelFilter: Array<string>) {
    this._fuelFilter.next(fuelFilter);
  }

  getPlantSuggestion(latitude: number, longitude: number, radius: number) {
    return this._httpClient.get<any>(MainServiceService.API_HOST_NAME + `/power-plant-suggestion?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }

}

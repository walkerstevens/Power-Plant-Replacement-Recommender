import { Injectable } from '@angular/core';
import { BehaviorSubject, flatMap, map, Observable, ReplaySubject, Subject } from 'rxjs';
import { dsv } from 'd3'
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  static readonly API_HOST_NAME = "https://5sloc23ke4.execute-api.us-east-1.amazonaws.com/dev"

  // If data is emitted before subscribing, ReplySubject will re-emit the data
  private _powerPlantData: ReplaySubject<any> = new ReplaySubject();
  powerPlantData$ = this._powerPlantData.asObservable();

  private _fuelFilter: BehaviorSubject<any> = new BehaviorSubject(null);
  fuelFilter$ = this._fuelFilter.asObservable();

  private _selectedPowerPlant: BehaviorSubject<any> = new BehaviorSubject(null);
  selectedPowerPlant$ = this._selectedPowerPlant.asObservable();

  private _powerPlantLCOEs: BehaviorSubject<Array<any>> = new BehaviorSubject(new Array());
  powerPlantLCOEs$ = this._powerPlantLCOEs.asObservable();
    
  private _radius: BehaviorSubject<number> = new BehaviorSubject(50);
  radius$ = this._radius.asObservable();  
    
  allFuels: Set<string>;

  constructor(private _httpClient: HttpClient) {}

  loadPowerPlantData() : Observable<any> {
    dsv(",", "./dataset/us_powerplants.csv",
      function (d) {
        return {
          // Define how data will be formatted
          name: d["name"],
          capacity_mw: +d["capacity_mw"]!,
          latitude: +d["latitude"]!,
          longitude: +d["longitude"]!,
          primary_fuel: d["primary_fuel"],
          commissioning_year: d["commissioning_year"],
          owner: d["owner"],
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
      for(let propertyWithFuelName of ["primary_fuel"]) {
        let fuelName = powerPlant[propertyWithFuelName];
        if(fuelName != null && fuelName != "") {
          fuelTypeSet.add(fuelName);
        }
      }
    }
    this.allFuels = fuelTypeSet;
  }

  getRenewableAlternativeLCOEs(latitude: number, longtitude: number, radius: number) : Observable<any> {
    let obs = this._httpClient.get(MainServiceService.API_HOST_NAME + `/capacity-factors?latitude=${latitude}&longitude=${longtitude}&radius=${radius}`,
      { 
        headers: new HttpHeaders(
          {
            "Content-Type": "application/json"
          })
      })
      .pipe(map((capacityFactoryInfos: any) => {
        return capacityFactoryInfos.map((capacityFactoryInfo: any) => {
          return {
            latitude: capacityFactoryInfo.latitude,
            longitude: capacityFactoryInfo.longitude,
            primaryFuelRecommendation: capacityFactoryInfo.primary_fuel_recommendation,
            yearlyProfitPerMW: capacityFactoryInfo.yearly_profit_per_mw,
            centsPerKwh: capacityFactoryInfo.cents_per_kwh
          }
        })
      }));
      
    obs.subscribe((powerPlantLCOEs) => {
      this._powerPlantLCOEs.next(powerPlantLCOEs)
    });

    return obs;
  }

  selectPowerPlant(powerPlant: any) {
    this._selectedPowerPlant.next(powerPlant);
  }

  setFuelFilter(fuelFilter: Array<string>) {
    this._fuelFilter.next(fuelFilter);
  }

  setRadius(radius: number) {
    this._radius.next(radius);
  }
}

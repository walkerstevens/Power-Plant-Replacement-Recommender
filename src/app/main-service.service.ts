import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { dsv } from 'd3'

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  // If data is emitted before subscribing, ReplySubject will re-emit the data
  private _powerPlantData: ReplaySubject<any> = new ReplaySubject();
  powerPlantData$ = this._powerPlantData.asObservable();

  fuelFilter$: Subject<Array<string>> = new Subject();
  fuelFilterObservable = this.fuelFilter$.asObservable();

  clickedPowerPlantInfo$: Subject<any> = new Subject();
  clickedPowerPlantInfoObservable = this.clickedPowerPlantInfo$.asObservable();

  allFuels: Set<string>;

  constructor() {}

  loadPowerPlantData() {
    dsv(",", "./dataset/us_powerplants.csv",
      function (d) {
        return {
          // Define how data will be formatted
          name: d["name"],
          gppd_idnr: d["gppd_idnr"],
          capacity_mw: +d["capacity_mw"]!,
          latitude: +d["latitude"]!,
          longitude: +d["longitude"]!,
          primary_fuel: d["primary_fuel"],
          other_fuel1: d["other_fuel1"],
          other_fuel2: d["other_fuel2"],
          other_fuel3: d["other_fuel3"],
          commissioning_year: d["commissioning_year"],
          owner: d["owner"],
          source: d["source"],
          url: d["url"],
          geolocation_source: d["geolocation_source"],
          wepp_id: d["wepp_id"],
          year_of_capacity_data: +d["year_of_capacity_data"]!,
          generation_gwh_2013: +d["generation_gwh_2013"]!,
          generation_gwh_2014: +d["generation_gwh_2014"]!,
          generation_gwh_2015: +d["generation_gwh_2015"]!,
          generation_gwh_2016: +d["generation_gwh_2016"]!,
          generation_gwh_2017: +d["generation_gwh_2017"]!,
          generation_gwh_2018: +d["generation_gwh_2018"]!,
          generation_gwh_2019: +d["generation_gwh_2019"]!,
          generation_data_source: d["generation_data_source"],
          estimated_generation_gwh_2013: +d["estimated_generation_gwh_2013"]!,
          estimated_generation_gwh_2014: +d["estimated_generation_gwh_2014"]!,
          estimated_generation_gwh_2015: +d["estimated_generation_gwh_2015"]!,
          estimated_generation_gwh_2016: +d["estimated_generation_gwh_2016"]!,
          estimated_generation_gwh_2017: +d["estimated_generation_gwh_2017"]!,
          estimated_generation_note_2013: d["estimated_generation_note_2013"],
          estimated_generation_note_2014: d["estimated_generation_note_2014"],
          estimated_generation_note_2015: d["estimated_generation_note_2015"],
          estimated_generation_note_2016: d["estimated_generation_note_2016"],
          estimated_generation_note_2017: d["estimated_generation_note_2017"]
      }
    }).then((data) => {
      // Emit to subscribers the data
      this._powerPlantData.next(data);
    });

    // Return obserable in case it is wanted
    return this.powerPlantData$;
  }
}

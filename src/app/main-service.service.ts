import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  fuelFilter$: Subject<Array<string>> = new Subject();
  fuelFilterObservable = this.fuelFilter$.asObservable();

  clickedPowerPlantInfo$: Subject<any> = new Subject();
  clickedPowerPlantInfoObservable = this.clickedPowerPlantInfo$.asObservable();

  allFuels: Set<string>;

  constructor() {

  }
}

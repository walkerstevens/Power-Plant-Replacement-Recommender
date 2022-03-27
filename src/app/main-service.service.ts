import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  fuelFilter$: Subject<Array<string>> = new Subject();
  fuelFilterObservable = this.fuelFilter$.asObservable();

  clickedPowerPlantInfo: any = null;

  allFuels: Set<string>;

  constructor() {

  }
}

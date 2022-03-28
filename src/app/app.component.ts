import { Component, OnInit } from '@angular/core';
import { MainServiceService } from './main-service.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private _mainService : MainServiceService) {}

  ngOnInit(): void {
    this._mainService.loadPowerPlantData();
  }

  loadPowerPlantData() {

  }
  
}

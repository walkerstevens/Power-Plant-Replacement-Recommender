import { Component, OnInit } from '@angular/core';
import { MainServiceService } from './main-service.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  a = 0

  constructor(private _mainService : MainServiceService) {}

  myfunction() {
    this.a += 1;
  }

  ngOnInit(): void {
    this._mainService.loadPowerPlantData();
  }
  
}

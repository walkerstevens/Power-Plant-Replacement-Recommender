import { Component, OnInit, ViewChild } from '@angular/core';
import { MainServiceService } from '../main-service.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  @ViewChild('fuelselect') select: MatSelect;
  fuelAllSelected = false;
  fuelFilterFormControl = new FormControl();

  selectedPowerPlant: any = null;
  recommendedPlant: any = null;

  radius = 50;

  constructor(public mainServiceService: MainServiceService) {

    this.mainServiceService.selectedPowerPlant$.subscribe((selectedPowerPlant) => {
      this.selectedPowerPlant = selectedPowerPlant;
      this.recommendedPlant = null;
    })

    this.mainServiceService.powerPlantLCOEs$.subscribe((lcoes) => {
      if(this.selectedPowerPlant != null) {
        this.recommendedPlant = lcoes.sort((a:any,b:any) => {
          if(a.lcoe < b.lcoe) return 1;
          if(a.lcoe > b.lcoe) return -1;
          return 0;
        })[0];
      }
    })
  }

  

  formatLabel(value: number) {
    return value;
  }

  fuelOptionToggleAllSelection() {
    if (this.fuelAllSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
      this.mainServiceService.setFuelFilter(this.select.options.map((item) => item.value));
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
      this.mainServiceService.setFuelFilter([]);
    }
  }

  fuelOptionClick() {
    // Check if all items are selected
    let newAllSelectedStatus = true;
    for(let item of this.select.options) {
      if (!item.selected) {
        // All items are not selected
        newAllSelectedStatus = false;
        break;
      }
    }
    this.fuelAllSelected = newAllSelectedStatus;
    this.mainServiceService.setFuelFilter(this.select.options.filter((item) => item.selected).map((item) => item.value));
  }

  computeRenewableAlternativesClick() {
    this.mainServiceService.selectedPowerPlant$.pipe(take(1)).subscribe((selectedPowerPlant) => {
      this.mainServiceService.getRenewableAlternativeLCOEs(selectedPowerPlant.latitude, selectedPowerPlant.longitude, this.radius)
    });
  }

  radiusChange(radius: any) {
    this.radius = radius.value;
    this.mainServiceService.setRadius(this.radius);
  }
  
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MainServiceService } from '../main-service.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @ViewChild('fuelselect') select: MatSelect;
  fuelAllSelected = false;
  fuelFilterFormControl = new FormControl();

  constructor(public mainServiceService: MainServiceService) { }

  ngOnInit(): void {
  }

  fuelOptionToggleAllSelection() {
    if (this.fuelAllSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
      this.mainServiceService.fuelFilter$.next(this.select.options.map((item) => item.value));
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
      this.mainServiceService.fuelFilter$.next([]);
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
    this.mainServiceService.fuelFilter$.next(this.select.options.filter((item) => item.selected).map((item) => item.value));
  }
}
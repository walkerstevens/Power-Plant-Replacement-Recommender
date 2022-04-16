import { ApplicationRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Map } from 'mapbox-gl';
import { MainServiceService } from '../../app/main-service.service'
import { select, scaleLinear } from 'd3';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit {

  map: Map;
  svg: any;
  powerPlants: any = [];
  powerPlantsFiltered: any = [];
  powerPlantCircles: any;

  constructor(private _applicationRef: ApplicationRef, private _snackBar: MatSnackBar, private _mainService: MainServiceService) { }

  ngOnInit(): void { }

  mapLoaded(map: Map): void {
    // Save map to class
    this.map = map;

    this.createD3SVG()
    this.mapPowerPlants()
  }

  createD3SVG() {
    // TODO: put styles in class
    this.svg = select(this.map.getCanvasContainer())
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("z-index", 2)
  }

  mapPowerPlants() {
    this._mainService.powerPlantData$.subscribe((powerPlantData) => {

      this.powerPlants = powerPlantData;
      this.powerPlantsFiltered = powerPlantData;

      this.createPowerPlantCircles();

      // When user drags or zooms, this needs to re-render d3
      this.bindMapBoxEvents();
      // Call once for initialiation
      this.render();
      // Register filter callback
      this.registerFilter();

    });
  }
  
  createPowerPlantCircles() {
    this.powerPlantCircles = this.svg.selectAll("circle")
      .data(this.powerPlantsFiltered)
      .enter()
      .append("circle")
      .attr("r", (d: any) => { return 3.5 + (14 * (d.capacity_mw / 6809)); })
      .style("fill", (d: any) => { return dotColor[d.primary_fuel] })
      .style("stroke", "#ffffff")
      .style("cursor", "pointer");

    this.powerPlantCircles.on("mouseover",
      (d: any) => { // TODO: not sure if d here is the data
        this.showHoverTooltip(d);
      }
    );
    this.powerPlantCircles.on("mouseout",
      (d: any) => {
        this.hideHoverTooltip();
      }
    );
    this.powerPlantCircles.on("click",
      (pointerEvent: PointerEvent, d: any) => {
        this._mainService.selectPowerPlant(d);
      }
    );
  }

  bindMapBoxEvents() {
    // Need to use arrow notation so 'this' is not lost
    this.map.on("viewreset", () => { this.render(); });
    this.map.on("move", () => { this.render(); });
    this.map.on("moveend", () => { this.render(); });
  }

  render() {
    this.powerPlantCircles
      .attr("cx", (d: any) => {
        return this.project(d).x;
      })
      .attr("cy", (d: any) => {
        return this.project(d).y;
      })
  }

  project(d: any) {
    return this.map.project(new mapboxgl.LngLat(d.longitude, d.latitude));
  }

  showHoverTooltip(powerPlant: any) {
    // TODO:
  }

  hideHoverTooltip() {
    // TODO:
  }

  registerFilter() {
    this._mainService.fuelFilter$.subscribe((fuelFilter) => {
      // Get all power plants that match the filter 
      this.powerPlantsFiltered = this.powerPlants.filter((powerPlant: any) => {
        return fuelFilter.includes(powerPlant.primary_fuel)
      });

      // Delete circles
      this.svg.selectAll("circle").remove();
      this.createPowerPlantCircles();
      this.render();
    });
  }
}

var dotColor: Record<string, string> = {};

dotColor['Coal'] = "#CF352E";  
dotColor['Petcoke'] = "#FF0038";
dotColor['Oil'] = "#8A0707";
dotColor['Gas'] = "#FF0800";
dotColor['Cogeneration'] = "#E32636";
dotColor['Solar'] = "#00BFFF";
dotColor['Wind'] = "#0073CF";
dotColor['Geothermal'] = "#1CA9C9";
dotColor['Hydro'] = "#1B5583";
dotColor['Waste'] = "#4682B4";
dotColor['Biomass'] = "#969696";
dotColor['Nuclear'] = "#6a51a3";
dotColor['Storage'] = "#778899";
dotColor['Other'] = "#C0C0C0";


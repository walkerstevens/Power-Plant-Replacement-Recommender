import { ApplicationRef, Component, OnInit } from '@angular/core';
import { parse } from 'papaparse'
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeoJSONSource, Map } from 'mapbox-gl';
import { MainServiceService } from '../../app/main-service.service'
import { select, svg } from 'd3';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: Map;
  svg: any;
  powerPlantCircles: any;

  constructor(private _applicationRef: ApplicationRef, private _snackBar: MatSnackBar, private _mainService: MainServiceService) {}

  ngOnInit(): void {}

  mapLoaded(map: Map): void {
    // Save map to class
    this.map = map;

    this.createD3SVG()
    this.mapPowerPlants()
    // When user drags or zooms, this needs to re-render d3
    this.bindMapBoxEvents();
    // Call once for initialiation
    this.render();
  }

  createD3SVG() {
    // TODO: check if this.map is even created yet
    // TODO: put styles in class
    console.log(this.map);
    this.svg = select(this.map.getCanvasContainer())
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("z-index", 2)
  }

  mapPowerPlants() {
    this._mainService.powerPlantData$.subscribe((powerPlantData) => {
      this.powerPlantCircles = this.svg.selectAll("circle")
        .data(powerPlantData)
        .enter()
        .append("circle")
        .attr("r", 5) // TODO: make variable
        .style("fill", "#51bbd6")
        .style("stroke", "#ffffff");
    });
  }

  bindMapBoxEvents() {
    // Need to use arrow notation so 'this' is not lost
    this.map.on("viewreset", () => { this.render(); });
    this.map.on("move", () => { this.render(); });
    this.map.on("moveend", () => { this.render(); });
  }

  render() {
    this.powerPlantCircles
      .attr("cx", (d:any) => {
        return this.project(d).x;
      })
      .attr("cy", (d:any) => {
        return this.project(d).y;
      })
  }

  project(d:any) {
    return this.map.project(new mapboxgl.LngLat(d.longitude, d.latitude));
  }
}

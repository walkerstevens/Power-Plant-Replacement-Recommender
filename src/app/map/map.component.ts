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

  // LCOE
  lcoes: any = [];
  lcoeCircles: any;
  radiusCircle: any;
  full_coordinates: any;
  radius = 500;

  // Tooltip
  toolTipVisible: boolean = false;
  hoveredPowerPlant: any;

  // Selected power plant
  selectedPowerPlant: any;
  selectedPowerPlantCircle: any;

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
      this.createLCOEPoints();

      // When user drags or zooms, this needs to re-render d3
      this.bindMapBoxEvents();
      // Call once for initialiation
      this.render();
      // Register filter callback
      this.registerFilter();
      // Register LCOE computation callback
      this.registerLCOEComputation();
      // Register radius callback
      this.registerRadiusCallback();
    });
  }
  
  createPowerPlantCircles() {
    this.powerPlantCircles = this.svg.selectAll(".pp")
      .data(this.powerPlantsFiltered)
      .enter()
      .append("circle")
      .classed("pp", true)
      .attr("r", this.getCirclRadius)
      .style("cursor", "pointer");

    this.powerPlantCircles.on("mouseover",
      (mouseEvent: any, d: any) => { // TODO: not sure if d here is the data
        this.showHoverTooltip(d);
      }
    );
    this.powerPlantCircles.on("mouseout",
      (mouseEvent: any, d: any) => {
        this.hideHoverTooltip();
      }
    );
    this.powerPlantCircles.on("click",
      (pointerEvent: PointerEvent, d: any) => {
        this.selectedPowerPlant = d;
        this._mainService.selectPowerPlant(d);
        if(this.radiusCircle != null) {
          this.radiusCircle.remove() 
        }
        this.svg.selectAll(".lcoe").remove();
        this.createCircleSquare();
        this.render();
      }
    );
  }

  createLCOEPoints() {

    let bestLCOE = this.lcoes.sort((a:any,b:any) => {
      if(a.lcoe < b.lcoe) return 1;
      if(a.lcoe > b.lcoe) return -1;
      return 0;
    }).slice(0, 1);

    this.lcoeCircles = this.svg.selectAll(".lcoe")
      .data(bestLCOE)
      .enter()
      .append("circle")
      .classed("lcoe", true)
      .attr("r", 10) // TODO: fix
      .style("fill", "#00FF00")
  }
    
  createCircleSquare() {    
    this.radiusCircle = this.svg
      .append("path")
      .lower()
      .attr("fill", "#888888")
      .style("opacity", 0.5);  
  }  

  getCirclRadius(d: any) {
    return 3.5 + (14 * (d.capacity_mw / 6809));
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
      .style("fill", (d: any) => {
        if(d == this.selectedPowerPlant) {
          return "#FFFF00";
        }
        return dotColor[d.primary_fuel];
      })
      .style("stroke", (d: any) => {
        if(d == this.selectedPowerPlant) {
          return "#000000";
        }
        return "#FFFFFF";
      });

    this.lcoeCircles
      .attr("cx", (d: any) => {
        return this.project(d).x;
      })
      .attr("cy", (d: any) => {
        return this.project(d).y;
      });

    if(this.radiusCircle != null) {

      let coordinates: any = get_lat_lon_filters(this.selectedPowerPlant.latitude, this.selectedPowerPlant.longitude, this.radius)
      this.full_coordinates = [
          {
          "latitude": coordinates[0],
          "longitude": coordinates[2]
          },
          {
          "latitude": coordinates[0],
          "longitude": coordinates[3],
          },
          {
          "latitude": coordinates[1],
          "longitude": coordinates[3]
          },
          {
          "latitude": coordinates[1],
          "longitude": coordinates[2]
          }]

      let coord_str: string = "M "
      for (let [i, coord] of this.full_coordinates.entries()) {
        let projectedCoords = this.project(coord);
        coord_str += projectedCoords.x; 
        coord_str += " ";
        coord_str += projectedCoords.y;
        if (i === 3) {
          coord_str += " Z"
        }
        else {
          coord_str += " L" 
        }
      }  
      
      this.radiusCircle
        .attr("d", coord_str)     
    }
  }

  project(d: any) {
    return this.map.project(new mapboxgl.LngLat(d.longitude, d.latitude));
  }

  showHoverTooltip(powerPlant: any) {
    this.toolTipVisible = true;
    this.hoveredPowerPlant = powerPlant;
  }

  hideHoverTooltip() {
    this.toolTipVisible = false;
    this.hoveredPowerPlant = null;
  }

  registerFilter() {
    this._mainService.fuelFilter$.subscribe((fuelFilter) => {
      // If filter is null grab everything
      if(fuelFilter == null) {
        return;
      }

      // Get all power plants that match the filter 
      this.powerPlantsFiltered = this.powerPlants.filter((powerPlant: any) => {
        return fuelFilter.includes(powerPlant.primary_fuel)
      });

      // Delete circles
      this.svg.selectAll(".pp").remove();
      // Create new ones
      this.createPowerPlantCircles();
      this.render();
    });
  }

  registerLCOEComputation() {
    this._mainService.powerPlantLCOEs$.subscribe((lcoes) => {

      this.lcoes = lcoes;

      // Delete circles
      this.svg.selectAll(".lcoe").remove();
      // Create new ones
      this.createLCOEPoints();
      this.render();

    })
  }

  registerRadiusCallback() {
    this._mainService.radius$.subscribe((radius: number) => {
      this.radius = radius;
      this.render();
    })
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

function get_lat_lon_filters(latitude: any, longitude: any, max_km: any) {
    // Constants
    const earth_circumference = 40007.863;
    const earth_radius = earth_circumference / (2 * Math.PI)
    const km_per_degree = earth_circumference / 360.0;
    const deg_per_radian = 57.2958;
    
    // Calculate the distance between meridians at the given latitude
    let km_between_meridians = (earth_circumference * Math.cos(latitude/deg_per_radian)) / 360;
        
    // Calculate the range of latitude values allowed based on user selected max_km
    let lat_plus_minus = max_km / km_per_degree;
    // Calculate the range of longitude values allowed based on user selected max_km
    let lon_plus_minus = max_km / km_between_meridians
    
    // Array to hold return values
    let coordinates = []; 
    // Store min allowed latitude (note latitudes will all be positive)
    coordinates[0] = latitude - lat_plus_minus;
    // Store max allowed latitude
    coordinates[1] = latitude + lat_plus_minus;
    // Store min allowed longitude (note longitudes will all be negative)
    coordinates[2] = longitude - lon_plus_minus;
    // Store max allowed longitude
    coordinates[3] = longitude + lon_plus_minus;   
    
    return coordinates;        
}  





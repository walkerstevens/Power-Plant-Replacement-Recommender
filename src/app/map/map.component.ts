import { ApplicationRef, Component, OnInit } from '@angular/core';
import { parse } from 'papaparse'
import { MatSnackBar } from '@angular/material/snack-bar';
import { GeoJSONSource, Map } from 'mapbox-gl';
import { MainServiceService } from '../../app/main-service.service'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {

  map: Map;
  title = 'team80-map';
  powerPlants: Array<any> = [];
  POWER_PLANT_SOURCE_DATA_TEMPLATE = {
    'type': 'FeatureCollection',
    'features': null
  }

  constructor(private _applicationRef: ApplicationRef, private _snackBar: MatSnackBar, private mainServiceService: MainServiceService) {
    this.mainServiceService.fuelFilterObservable.subscribe(this.onFuelFilterChange)
  }

  ngOnInit(): void { }

  onFuelFilterChange = (fuelFilter: Array<String>) => {
    let filteredPowerPlants = this.powerPlants.filter((powerPlant) => {
      return fuelFilter.includes(powerPlant.primary_fuel);
    });
    let features = this.createPowerPlantFeatures(filteredPowerPlants);
    let data = Object.create(this.POWER_PLANT_SOURCE_DATA_TEMPLATE);
    data.features = features;
    (<GeoJSONSource>this.map.getSource("powerplants")).setData(data)
  }

  getAllFuels(powerPlants: any): void {

    let primaryFuels: Set<string> = new Set();
    for (let powerPlant of powerPlants) {
      primaryFuels.add(powerPlant.primary_fuel)
    }
    this.mainServiceService.allFuels = primaryFuels;
  }

  createPowerPlantFeatures(powerPlants: Array<any>): Array<any> {
    let features: any = [];
    powerPlants.forEach((powerPlant: any) => {
      features.push(
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [powerPlant.longitude, powerPlant.latitude]
          },
          'properties': {
            'title': powerPlant.name,
            'capacity': parseFloat(powerPlant.capacity_mw),
            'primary_fuel': powerPlant.primary_fuel
          }
        }
      );
    });
    return features;
  }

  mapLoaded(map: Map): void {

    this.map = map;

    parse("./dataset/us_powerplants.csv", {
      header: true,
      delimiter: ',',
      download: true,
      complete: (results: any) => {

        this.powerPlants = results.data.filter((result: any) => !isNaN(result.longitude) && !isNaN(result.latitude));
        this.getAllFuels(this.powerPlants);

        this.loadPowerPlantsOnMap();

        // Register callbacks if feature is clicked
        this.map.on('click', 'unclustered-point', (event) => {
          if(event.features) {
            this.mainServiceService.clickedPowerPlantInfo$.next(event.features[0].properties);
            this._applicationRef.tick()
          }
        });

        // Show mouse pointer when hovering over feature
        this.map.on('mouseenter', 'unclustered-point', () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', 'unclustered-point', () => {
          this.map.getCanvas().style.cursor = '';
        });
      },
      error: () => {
        this._snackBar.open('Could not load power plant csv');
      }
    });
  }

  loadPowerPlantsOnMap() {
    let features = this.createPowerPlantFeatures(this.powerPlants);
    this.map.addSource('powerplants', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': features
      },
      cluster: true,
      clusterMaxZoom: 30, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'powerplants',
      filter: ['has', 'point_count'],
      paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'powerplants',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    this.map.addLayer({
      id: 'unclustered-text',
      type: 'symbol',
      source: 'powerplants',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'title'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
      }
    });

    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'powerplants',
      filter: ['!', ['has', 'point_count']],
      paint: {
        //'circle-color': [
        //  'interpolate',
        //  ['linear'],
        //  ["sqrt", ["/", ["get", "capacity"], Math.PI]],
        //  0, '#deebf7',
        //  100, '#3182bd',
        //],
        'circle-color': '#51bbd6',
        'circle-radius': 10,
        //'circle-stroke-width': 1,
        //'circle-stroke-color': '#fff'
      }
    });
  }
}

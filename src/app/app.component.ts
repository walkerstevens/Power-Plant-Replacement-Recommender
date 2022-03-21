import { AfterViewInit, Component, OnInit } from '@angular/core';
import { parse } from 'papaparse'
import { MatSnackBar } from '@angular/material/snack-bar';
import { Map, Marker } from 'mapbox-gl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  map : Map;
  title = 'team80-map';
  powerPlants : Array<any> = [];

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  test(map: Map): void {
    console.log("test");
  }

  mapLoaded(map: Map): void {
    parse("./dataset/us_powerplants.csv", {
      header: true,
      delimiter: ',',
      download: true,
      complete: (results : any) => {
        
        let features : any = [];
        this.powerPlants = results.data.filter((result: any) => !isNaN(result.longitude) && !isNaN(result.latitude))
          .forEach((element: any) => {
            features.push(
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [element.longitude, element.latitude]
                },
                'properties': {
                  'title': element.name
                }
              }
            );
          });;


        map.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error, image:any) => {
            if (error) throw error;
              
            map.addImage('custom-marker', image);
              
            // Add a GeoJSON source with 2 points
            map.addSource('points', {
              'type': 'geojson',
              'data': {
                'type': 'FeatureCollection',
                'features': features
              }
            });
           
            // Add a symbol layer
            map.addLayer({
              'id': 'points',
              'type': 'symbol',
              'source': 'points',
              'layout': {
                'icon-image': 'custom-marker',
                // get the title name from the source's "title" property
                'text-field': ['get', 'title'],
                'text-font': [
                  'Open Sans Semibold',
                  'Arial Unicode MS Bold'
                ],
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
              }
            });
          }
        );
      },
      error: () => {
        this._snackBar.open('Could not load power plant csv');
      }
    });
  }
}

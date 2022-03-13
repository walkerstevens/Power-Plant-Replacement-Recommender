# TEAM80 Workspace
* Shared VM
  * Ubuntu 20 VM with xrdp running
  * VM Spec: Standard B4ms (4 vcpus, 16 GiB memory)
* Jupyter Notebook
  * Set for Access from Public
* D3 Skeleton Page
  * Originated from HW2-Q5, updated geojsons and selection menu as a starting point.
* Datasets
  * Weather
  * Powerplants
  * GeoJson


# Accessing Shared VM from Azure
* RDP to team80.ohmyedu.com 
* SSH to team80.ohmyedu.com:22 
* ID/PW: team80/team80!23456

* 1TB data volume is mounted at /mnt/data (Standard SSD)

# Accessing Jupyter Notebook
* http://team80.ohmyedu.com:8888
* ID/PW: team80/team80!23456

# D3 Visualizaiton Skeleton Page
* http://team80.ohmyedu.com:8000/choropleth.html

# Datasets
## Weather Data - tmy2020.h5
- Overview: https://nsrdb.nrel.gov/data-sets/tmy
- Year 2020 Downloaded from https://data.openei.org/s3_viewer?bucket=nrel-pds-nsrdb&prefix=v3%2Ftmy%2F
- Manual at http://team80.ohmyedu.com:8888/files/doc/43156.pdf

## Existing Powerplants Data - from team drive, filtered for only USA & solar/wind type
 - http://team80.ohmyedu.com:8888/edit/dataset/global_power_plant_database_usa_solar.csv
 - http://team80.ohmyedu.com:8888/edit/dataset/global_power_plant_database_usa_wind.csv

## US Geojsons
 - States Level: http://team80.ohmyedu.com:8000/gz_2010_us_040_00_20m.json
 - County Level: http://team80.ohmyedu.com:8000/gz_2010_us_050_00_20m.json

# Playing around datasets
See http://team80.ohmyedu.com:8888/notebooks/htpyd_example.ipynb

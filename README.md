# TEAM80 Workspace
* Shared VM
* Jupyter Notebook
* D3 Skeleton Page
* Datasets
* API Manuals & Tips* 


# Accessing Shared VM from Azure
* RDP to team80.ohmyedu.com (Ubuntu 20 VM with xrdp running)
* ID/PW: team80/team80!23456
* VM Spec: Standard B4ms (4 vcpus, 16 GiB memory)
* 1TB data volume is mounted at /dev/data (Standard SSD)

# Accessing Jupyter Notebook
* http://team80.ohmyedu.com:8888
* ID/PW: team80/team80!23456

# D3 Visualizaiton Skeleton Page
* http://team80.ohmyedu.com:8000/choropleth.html

# Datasets
* Weather Data - tmy2020.h5
- Downloaded from https://data.openei.org/s3_viewer?bucket=nrel-pds-nsrdb&prefix=v3%2Ftmy%2F\n
- Manual at http://team80.ohmyedu.com:8888/files/doc/43156.pdf

* Existing Powerplants Data - tmy2020.h5
 * http://team80.ohmyedu.com:8888/edit/dataset/global_power_plant_database_usa_solar.csv
 * http://team80.ohmyedu.com:8888/edit/dataset/global_power_plant_database_usa_wind.csv

* US Geojsons
 * States Level: http://team80.ohmyedu.com:8888/edit/gz_2010_us_040_00_20m.json
 * County Level: http://team80.ohmyedu.com:8888/edit/gz_2010_us_050_00_20m.json

# Playing around datasets
See http://team80.ohmyedu.com:8888/notebooks/htpyd_example.ipynb

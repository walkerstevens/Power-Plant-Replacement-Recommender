#!/usr/bin/env python
# coding: utf-8

# In[1]:


# 


# In[2]:


import h5pyd
import h5py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from scipy.spatial import cKDTree

# Open the desired year of nsrdb data
# server endpoint, username, password is found via a config file
f = h5py.File('dataset/tmy2020.h5', 'r')
list(f.keys())


# In[3]:


clearsky_ghidset = f['clearsky_ghi']
clearsky_ghidset_attr = clearsky_ghidset.attrs
clearsky_ghidset[0:10]
clearsky_ghidset.shape


# In[4]:


for k,v in clearsky_ghidset_attr.items():
    print(str(k) + ' , ' + str(v))


# In[5]:


wind_speed = f['wind_speed']
wind_speed_attr = wind_speed.attrs
wind_speed[0:10]
wind_speed.shape

air_temperature = f['air_temperature']
air_temperature_attr = air_temperature.attrs
air_temperature[0:10]
air_temperature.shape


# In[106]:


# Get coordinates in USA only (2018392 items -> 546219 items)
meta = pd.DataFrame(f['meta'][...])
USA = meta.loc[meta['country'] == b'United States'] # Note .h5 saves strings as bit-strings
USA.head()
df_coord_usa = USA[['latitude', 'longitude']].copy()
df_coord_usa.shape
df_coord_usa.head(600000)

# dset = f['ghi']
# data = dset[0][USA.index]  # full-resolution subset


# In[137]:


dset_coords = f['coordinates'][...]

dset_names = ['air_temperature',
 'alpha',
 'aod',
 'asymmetry',
 'cld_opd_dcomp',
 'cld_reff_dcomp',
 'clearsky_dhi',
 'clearsky_dni',
 'clearsky_ghi',
 'cloud_press_acha',
 'cloud_type',
 'dew_point',
 'dhi',
 'dni',
 'ghi',
 'ozone',
 'relative_humidity',
 'solar_zenith_angle',
 'ssa',
 'surface_albedo',
 'surface_pressure',
 'total_precipitable_water',
 'wind_direction',
 'wind_speed']

tree = cKDTree(dset_coords)
def nearest_site(tree, lat_coord, lon_coord):
    lat_lon = np.array([lat_coord, lon_coord])
    dist, pos = tree.query(lat_lon)
    return pos

ploc = (44.3142,-89.8964)
ploc_idx = nearest_site(tree, ploc[0], ploc[1] )
print(ploc_idx)
print(dset_coords[ploc_idx])

# df = pd.DataFrame(f['meta'][...])
# df['ghi'] = data / dset.attrs['psm_scale_factor']

dict_result = {}

dict_result['latitude'] = dset_coords[ploc_idx][0]
dict_result['longitude'] = dset_coords[ploc_idx][1]

for field in dset_names:
    print(field)
    dset = f[field]
    dict_result[field] = np.mean(dset[::1,ploc_idx] / dset.attrs['psm_scale_factor'])

#print(dict_result)

df = pd.DataFrame([dict_result])
pd.set_option('display.max_columns', None)
df.head()


# In[ ]:


# for i in range(0, dset_ghi.shape[1], 1):
#     #print(dset_ghi[i, ::1])
#     arr_ghi = np.mean(dset_ghi[i, ::1])
#     print(str(i) + ' ' + str(arr_ghi))

# for i in range(0, len(time_index), 365):
#     print(dset_ghi[i, ::1])
#     df[i] = dset_ghi[i, ::1]

# dict_data = {}
# for i in range(0, len(time_index), 365):
#     #print('time index ' + str(i))
#     rows = dset_ghi[i, ::1]
#     dict_data[str(i)] = rows
#     print('time index ' + str(i) + ' ' + str(rows) + ' ' + str(len(rows)))

# df['longitude'] = coords[::10, 1]

# dict_data
#df['longitude'] = coords[::10, 1]
#df['latitude'] = coords[::10, 0]

# df = pd.DataFrame(dict_data) # Combine data with coordinates in a DataFrame

#df.head(1000000)


# In[7]:


df.head()
df.mean(axis=1)


# In[9]:





# In[10]:


for k,v in air_temperature_attr.items():
    print(str(k) + ' , ' + str(v))

f['air_temperature'][10][1398800] / air_temperature_attr['psm_scale_factor']


# In[11]:


coordinates = f['coordinates']
coordinates_attr = coordinates.attrs
coordinates[0:10]


# In[42]:


# Extract datetime index for datasets
time_index = pd.to_datetime(f['time_index'][...].astype(str))
time_index # Temporal resolution is 30min


# In[47]:


# Locational information is stored in either 'meta' or 'coordinates'
meta = pd.DataFrame(f['meta'][...])
meta.head()


# In[69]:


# Extract coordinates (lat, lon)
#print(dict(f['coordinates'].attrs))
coords = f['coordinates'][...]
#coords.shape
#pd_coords = pd.DataFrame(coords)
#pd_coords.head()


# In[63]:


time_index = pd.to_datetime(f['time_index'][...].astype(str))
time_index


# In[83]:


timestep = np.where(time_index == '2020-01-31 00:30:00')[0][0]
timestep
dset = f['ghi']
get_ipython().run_line_magic('time', 'data = dset[timestep, ::10]   # extract every 10th location at a particular time')
df = pd.DataFrame() # Combine data with coordinates in a DataFrame
df['longitude'] = coords[::10, 1]
df['latitude'] = coords[::10, 0]
df['ghi'] = data / dset.attrs['psm_scale_factor'] # unscale dataset
df.head()


# In[63]:


timestep = np.where(time_index == '2020-01-01 00:30:00')[0][0]
timestep
dset = f['ghi']
get_ipython().run_line_magic('time', 'data = dset[timestep, ::10]   # extract every 10th location at a particular time')
df = pd.DataFrame() # Combine data with coordinates in a DataFrame
df['longitude'] = coords[::10, 1]
df['latitude'] = coords[::10, 0]
df['ghi'] = data / dset.attrs['psm_scale_factor'] # unscale dataset


# In[80]:


df.plot.scatter(x='longitude', y='latitude', c='ghi',
                colormap='YlOrRd',
                title=str(time_index[timestep]))
plt.show()


# In[62]:


meta = pd.DataFrame(f['meta'][...])
USA = meta.loc[meta['country'] == b'United States']
print(USA.shape)
USA.head()


# In[55]:


# Full resolution subset of Colorado
meta = pd.DataFrame(f['meta'][...])
CA = meta.loc[meta['state'] == b'California'] # Note .h5 saves strings as bit-strings
CA.head()


# In[67]:


get_ipython().run_line_magic('time', 'data = dset[timestep][CA.index]  # full-resolution subset')
df = CA[['longitude', 'latitude']].copy()
df['ghi'] = data / dset.attrs['psm_scale_factor']
df.shape


# In[68]:


df.plot.scatter(x='longitude', y='latitude', c='ghi',
                colormap='YlOrRd',
                title=str(time_index[timestep]))
plt.show()


# In[ ]:





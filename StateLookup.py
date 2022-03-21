"""
Script to find which state each power plant in the "us_powerplants.csv" file is in,
by calling the Nominatim API with the latitude and longitude of the plant.
Author: Nathan Miller
Date: March 20th, 2022
"""

from geopy.geocoders import Nominatim
import pandas as pd
import time

# Nominatim API requires an app name and email address
user_info = 'OneTimeStateLookup-nmiller93@gatech.edu'

# Initialize Nominatim API with user info
geolocator = Nominatim(user_agent=user_info)

# Read in power plant data
plant_data = pd.read_csv('us_powerplants.csv')

# Make sure the data is importing correctly
# print(plant_data.head())
# print(len(plant_data.index))

# Create empty lists to hold the power plant ID's and states
gppd_idnr = []
states = []


def recover_from_error(gppd_idnr, states):
    """
    Function to write plant ID's and states to a CSV file in the event the API becomes unresponsive
    :param gppd_idnr: list of plant ID's
    :param states: list of states
    :return: None
    """
    # Combine gpdd_idnr and state into list of tuples
    state_tuples = list(zip(gppd_idnr, states))

    # Create dataframe
    recovery_df = pd.DataFrame(state_tuples, columns=['gppd_idnr', 'state'])

    # Save dataframe to CSV
    recovery_df.to_csv('recovery_df.csv', index=False)


# Iterate through each row of data and get the state from Lat/Lon
for index, row in plant_data.iterrows():
    print('Retrieving row: ', index)

    # Get latitude and longitude for plant
    latitude = row['latitude']
    longitude = row['longitude']

    retries = 0
    location = ''

    # The Nominatim API is frequently unreachable
    # This will retry 3 times and ensure results are saved if it becomes unreachable
    while not location:
        try:
            # Request location from API
            location = geolocator.reverse(f'{latitude}, {longitude}')
            retries = 0
        except:
            time.sleep(5)
            retries = retries + 1
            print("Retry number ", retries)
            if retries > 3:
                recover_from_error(gppd_idnr, states)
                raise SystemExit

    # Convert location to address and then state
    address = location.raw['address']
    state = address.get('state', '')

    # Append results to lists
    states.append(state)
    gppd_idnr.append(row['gppd_idnr'])

    # Nominatum API only allows 1 API call per second
    time.sleep(1.1)

try:
    # Add states column to power plant dataframe
    plant_data['state'] = states

    # Save power plant data to new csv file
    plant_data.to_csv('powerplants_with_states.csv', index=False)

except:
    recover_from_error(gppd_idnr, states)

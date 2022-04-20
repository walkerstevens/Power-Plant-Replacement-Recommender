import json
import psycopg2
from psycopg2.extras import RealDictCursor
import math

def get_lat_lon_filters(latitude, longitude, max_km):
    
    # Constants
    earth_circumference = 40007.863;
    earth_radius = earth_circumference / (2 * math.pi)
    km_per_degree = earth_circumference / 360.0;
    deg_per_radian = 57.2958;
    
    # Calculate the distance between meridians at the given latitude
    km_between_meridians = (earth_circumference * math.cos(latitude/deg_per_radian)) / 360;
        
    # Calculate the range of latitude values allowed based on user selected max_km
    lat_plus_minus = max_km / km_per_degree;
    # Calculate the range of longitude values allowed based on user selected max_km
    lon_plus_minus = max_km / km_between_meridians
    
    # Array to hold return values
    coordinates = [0, 0, 0, 0]; 
    # Store min allowed latitude (note latitudes will all be positive)
    coordinates[0] = latitude - lat_plus_minus
    # Store max allowed latitude
    coordinates[1] = latitude + lat_plus_minus
    # Store min allowed longitude (note longitudes will all be negative)
    coordinates[2] = longitude - lon_plus_minus
    # Store max allowed longitude
    coordinates[3] = longitude + lon_plus_minus  
    
    return coordinates

def get_query_results(coordinates):
    
    conn = psycopg2.connect(database = "team80database", user = "postgres", password = "team80-password", host = "44.196.120.111", port = "5432")
    cur = conn.cursor(cursor_factory = RealDictCursor)
    
    cur.execute("""
    SELECT *
    FROM us_coordinates_final
    WHERE (latitude >= {} AND latitude <= {}) AND (longitude >= {} AND longitude <= {})
    """.format(coordinates[0], coordinates[1], coordinates[2], coordinates[3]))

    return cur.fetchall()

def clamp(x, min_bound, max_bound):
    if x < min_bound:
        return min_bound
    if x > max_bound:
        return max_bound
    return x

def lambda_handler(event, context):
    
    # Gets parameters
    latitude = float(event["latitude"])
    longitude = float(event["longitude"])
    radius = float(event["radius"])
    
    # Clamp to bounds
    latitude = clamp(latitude, -90, 90)
    longitude = clamp(longitude, -180, 180)
    radius = clamp(radius, 0, 200)

    return get_query_results(get_lat_lon_filters(latitude, longitude, radius))


# Mathematical constants
Rv = 461.4964
Rd = 287.0531
Eso = 6.1078
c0 = 0.99999683
c1 = -0.90826951e-2
c2 = 0.78736169e-4
c3 = -0.61117958e-6
c4 = 0.43884187e-8
c5 = -0.29883885e-10
c6 = 0.21874425e-12
c7 = -0.17892321e-14
c8 = 0.11112018e-16
c9 = -0.30994571e-19


def CalculateAirDensity(temp, press, dew_point):
    """
    Function for calculating the density of humidified air.
    :param temp: ambient temperature in degrees Celsius
    :param press: ambient air pressure in hPa
    :param dew_point: dew point in degrees Celsius
    :return: air density in kg/m3
    Reference: All constants and formulas were taken from
               https://www.gribble.org/cycling/air_density.html
    """
    # Calculate pressure of water vapor
    p = c0 + dew_point * \
        (c1 + dew_point * \
        (c2 + dew_point * \
        (c3 + dew_point * \
        (c4 + dew_point * \
        (c5 + dew_point * \
        (c6 + dew_point * \
        (c7 + dew_point * \
        (c8 + dew_point * \
        (c9)))))))))

    press_water_vapor = Eso / (p ** 8)

    # Calculate pressure of dry air
    press_dry_air = press - press_water_vapor

    # Convert air temperature from Celcius to Kelvins
    temp_K = temp + 273.15

    # Calculate air density
    return ((press_dry_air / (Rd * temp_K)) + (press_water_vapor / (Rv * temp_K))) * 100

def WindPowerDensity(wind_speed, temp, press, dew_point):
    """
    Function to calculate the theoretical wind power density according to:
    [12] H. Cetinay, F. A. Kuipers, and A. N. Guven, “Optimal siting and sizing of wind farms,”
         Renewable Energy, 101, 51-58, 2017.
    :param wind_speed: wind speed
    :param temp: ambient temperature in degrees Celsius
    :param press: ambient air pressure in hPa
    :param dew_point: dew point in degrees Celsius
    :return:
    """
    return 0.5 * CalculateAirDensity(temp, press, dew_point) * (wind_speed**3)

# I ensured the returned density matches the calculator at https://www.gribble.org/cycling/air_density.html
print(CalculateAirDensity(25, 980, 10))

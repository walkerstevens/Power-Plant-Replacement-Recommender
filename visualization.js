// Define margin and dimensions for svg
var margin = {top: 20, right: 10, bottom: 20, left: 10};
var padding = 30;
var outerWidth = 1024;
var outerHeight = 768;
var width = outerWidth - padding;
var height = outerHeight - padding;

// Variables to store loaded data
var STATE_MAP;  // Store state map data from json
var COUNTY_MAP;  // Store county map data from json
var PLANT_DATA;  // Store power plant data from csv
var STATE_DATA;  // Store power plant data by state

var CURRENT_VIEW = 'state';  // Could be used to switch between showing state or county lines 
const STARTING_SCALE = 0.65  // This changes how big the US map is at the start
const format2decimals = d3.format(".2f")

// Create main choropleth map svg
var svg = d3.select(".layer3").append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            .attr("id", "choropleth") 
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("style", "outline: thin solid black;");

// Create seperate SVG for the legend
// Not sure we want to do this or if we even need a legend 
var legend_svg = d3.select(".layer3").append("svg")
                   .attr("width", 200)
                   .attr("height", 200)
                   .attr("id", "box1") 
                   .attr("transform", "translate(" + (margin.left * 2) + "," + (margin.top - outerHeight + 200) + ")")
                   .attr("style", "outline: thin solid black;");

// Create another svg for a widget that will display stats about a state
// This is not currently being used
/*
var stats_svg = d3.select(".layer3").append("svg")
                  .attr("width", 400)
                  .attr("height", 300)
                  .attr("id", "box2") 
                  .attr("transform", "translate(" + (margin.left * 2 - 200) + "," + (margin.top - outerHeight + 500) + ")")
                  .attr("style", "outline: thin solid black;");
*/

// Define tooltip when hovering over a state
// TODO: Add stats for the state based on selected fuel type
var state_tooltip = d3.tip()
                      .attr('id', 'tooltip')
                      .html(function(d) { return String(d.properties.name); });

// Define tooltip when hovering over a power plant
var plant_tooltip = d3.tip()
                      .attr('id', 'tooltip')
                      .html(function(d) { 
                              return String(
                              "Name: " + d.name + "<br/>" + 
                              "Year Commissioned: " + d.commissioning_year + "<br/>" +
                              "Owner: " + d.owner + "<br/>" +
                              "Yearly Production: " + format2decimals(d.generation_gwh_2019))
                      });

// Define color scheme
var colorScheme = d3.schemeReds[4];
colorScheme.unshift("grey");

// Define color scale
var colorScale = d3.scaleThreshold()
                   .range(colorScheme);

// Define projection
var projection = d3.geoAlbersUsa()
                   
// Define path
var path = d3.geoPath()
             .projection(projection);


// Promise to get county map data
const promise_county_map = d3.json("gz_2010_us_050_00_20m.json", function(json) {
                              svg.selectAll("path")
                                 .data(json.features)
                                 .enter()
                                 .append("path")
                                 .attr("d", path) 
                            });

// Promise to get state map data
const promise_state_map = d3.json("us-states.json", function(json) {
                            svg.selectAll("path")
                               .data(json.features)
                               .enter()
                               .append("path")
                               .attr("d", path) 
                            });

// Promise to get power plant data
const promise_plant_data = d3.dsv(",", "dataset/us_powerplants.csv", function (d) { return {
                                // Define how data will be formatted
                                name: d.name,
                                gppd_idnr: d.gppd_idnr,
                                capacity_mw: +d["capacity_mw"],
                                latitude: +d["latitude"],
                                longitude: +d["longitude"],
                                primary_fuel: d.primary_fuel,
                                other_fuel1: d.other_fuel1,
                                other_fuel2: d.other_fuel2,
                                other_fuel3: d.other_fuel3,
                                commissioning_year: d.commissioning_year,
                                owner: d.owner,
                                source: d.source,
                                url: d.url,
                                geolocation_source: d.geolocation_source,
                                wepp_id: d.wepp_id,
                                year_of_capacity_data: +d["year_of_capacity_data"],
                                generation_gwh_2013: +d["generation_gwh_2013"],
                                generation_gwh_2014: +d["generation_gwh_2014"],
                                generation_gwh_2015: +d["generation_gwh_2015"],
                                generation_gwh_2016: +d["generation_gwh_2016"],
                                generation_gwh_2017: +d["generation_gwh_2017"],
                                generation_gwh_2018: +d["generation_gwh_2018"],
                                generation_gwh_2019: +d["generation_gwh_2019"],
                                generation_data_source: d.generation_data_source,
                                estimated_generation_gwh_2013: +d["estimated_generation_gwh_2013"],
                                estimated_generation_gwh_2014: +d["estimated_generation_gwh_2014"],
                                estimated_generation_gwh_2015: +d["estimated_generation_gwh_2015"],
                                estimated_generation_gwh_2016: +d["estimated_generation_gwh_2016"],
                                estimated_generation_gwh_2017: +d["estimated_generation_gwh_2017"],
                                estimated_generation_note_2013: d.estimated_generation_note_2013,
                                estimated_generation_note_2014: d.estimated_generation_note_2014,
                                estimated_generation_note_2015: d.estimated_generation_note_2015,
                                estimated_generation_note_2016: d.estimated_generation_note_2016,
                                estimated_generation_note_2017: d.estimated_generation_note_2017,
                                state: d.state
                            }});


/**
 * TODO: Write this function (might be able to accomplish this with D3.nest() instead)
 * @param {object} plant_data - a list of plants for a given fuel type
 * @return {object} - a list of all states and their generation for the given fuel type
 */  
function getPowerGenerationByState(plant_data) {

};


Promise.all([promise_state_map, promise_county_map, promise_plant_data]).then((values, error) => {
    // Read in data files
    STATE_MAP = values[0]
    COUNTY_MAP = values[1]  // County map is not currently used
    PLANT_DATA = values[2]
 
    // TODO: Implement nest function to get stats for each state
    //STATE_DATA = d3.nest()
    //               .key(d => d.state).sortKeys((a, b) => d3.ascending(a, b))
    //               .rollup(d => d.state)
    //               .entries(PLANT_DATA);
    
    // Display the map
    ready(error, STATE_MAP, PLANT_DATA);
    
});


/**
 * TODO: Rename this function and make its purpose more specific. It is a remnant of the HW assignment. 
 * This function: 
 * 1) Adds fuel types to the dropdown menu
 * 2) Sets up an event listener for the dropdown menu
 * 3) Calls createMapAndLegend()
 * @param {object} error - null if no errors in retrieving data, otherwise the error description 
 * @param {object} state_map - geoJSON coordinates of the US states
 * @param {object} plant_data - US power plant data
 * @return {undefined}
 */
function ready(error, state_map, plant_data) {
    if (error) {
        // TODO: manage errors
        
    }
    
    // Get plant primary fuel types from plant_data
    plant_types = d3.map(plant_data, function(d){return d.primary_fuel}).keys()
                   .sort(d3.ascending);
    
    // Add plant fuel types to dropdown menu
    d3.select("#plantDropdown")
      .selectAll("option")
      .data(plant_types)
      .enter()
      .append("option")
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })

    // Event listener for plant dropdown menu change
    d3.select("#plantDropdown")
      .on("change", function() {
        createMapAndLegend(state_map, plant_data, this.value)
    });
    
    // Create Choropleth with default option 
	createMapAndLegend(state_map, plant_data, d3.select('#plantDropdown option:checked').text());
}


/**
 * Create a Choropleth map and legend using the state_map, plant_data, and fuel type
 * @param {object} state_map - geoJSON coordinates of the US states
 * @param {object} plant_data - US power plant data
 * @param {string} selected_fuel - the fuel source the user selected from the dropdown 
 * @return {undefined}
 */
function createMapAndLegend(state_map, plant_data, selected_fuel){ 
    
    d3.select("#states").remove();
    d3.select("#power_plants").remove();
    d3.select("#tooltip").remove();
    
    // Invoke the tip in the context of the SVG
    svg.call(state_tooltip)
    svg.call(plant_tooltip)
             
    // Shade state based on energy production by selected fuel type
    
    // Filter plants to only include those of selected fuel type
    filtered_plants = plant_data.filter(function(d) {
        return d.primary_fuel === selected_fuel;
    })
    
    
    // TODO: Currently this selects only the generation from 2019 for each plant.
    //       Need to update this to calculate total generation for each state.
    //       Probably also need to remove outlier values.
    plants_list = filtered_plants.map(function(d) {
       return d["generation_gwh_2019"]
    });

    // Order list by 
    sorted_plants_list = plants_list.sort(function(a,b) { return a - b;});
    
    color_threshold_list = [
        d3.quantile(sorted_plants_list, 0.0), 
        d3.quantile(sorted_plants_list, 0.25), 
        d3.quantile(sorted_plants_list, 0.5), 
        d3.quantile(sorted_plants_list, 0.75), 
        d3.quantile(sorted_plants_list, 1.0)
        ];

    label_color_legend = [
        String(color_threshold_list[0]) + " to " + String(color_threshold_list[1]),
        String(color_threshold_list[1]) + " to " + String(color_threshold_list[2]),
        String(color_threshold_list[2]) + " to " + String(color_threshold_list[3]),
        String(color_threshold_list[3]) + " to " + String(color_threshold_list[4])
    ]
    
    // Get quantiles for the average_rating values
    colorScale.domain(color_threshold_list.slice(0,5));
    
    
    // Create a container that contains all zoom-able elements
    // How each element should zoom needs to be defined in the "zooming" function
	var map = svg.append("g")
				.attr("id", "map")
				.call(d3.zoom().on("zoom", zooming))  // Bind the zoom behavior
                .call(zoom.transform, d3.zoomIdentity  // Apply the initial transform
							.translate(width/2, height/2)
							.scale(STARTING_SCALE));
    
    // Define a group element to hold the states
    var states = map.append("g")
                    .attr("id", "states")
    
    // Draw the states map  
    states.selectAll("path")
          .data(state_map.features)
          .enter()
          .append("path")
          .attr("class", "state")
          .attr("d", path)
          .attr("fill", function (d) { return colorScale(1); })
          .attr("stroke", "white")
          .attr("stroke-width", "0.5")
          .on('mouseover', state_tooltip.show)
          .on('mouseout', state_tooltip.hide);
    
    // Define a group element to hold the power plants
	var power_plants = map.append("g")
        .attr("id", "power_plants")
	
	// Plot power plants as circles
	// TODO: Currently all plants for the selected fuel type are displayed.
	//       This could be changed to show only top x number of plants
	//       with radius depending on the size of the power plant.
	power_plants.selectAll("circle")
		        .data(filtered_plants)
		        .enter()
		        .append("circle")
		        .attr("cx", function(d) {
			        return projection([d.longitude, d.latitude])[0];
		        })
		        .attr("cy", function(d) {
		            return projection([d.longitude, d.latitude])[1];
		        })
		        .attr("r", 4.0)
		        .style("fill", "yellow")
		        .style("stroke", "gray")
		        .style("stroke-width", 0.25)
		        .style("opacity", 0.75)
		        .on('mouseover', plant_tooltip.show)
                .on('mouseout', plant_tooltip.hide);          
    
    // Define a group element for the legend
    var g = legend_svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(10,10)");
    
    // Define the legend
    var legend = d3.legendColor()
        .labels(label_color_legend)
        .shapePadding(4)
        .scale(colorScale);
    
    // Call the legend
    legend_svg.select("#legend")
        .call(legend);
               
}


// Define what to do when panning or zooming
var zooming = function(d) {

	//Log out d3.event.transform, so you can see all the goodies inside
	//console.log(d3.event.transform);

	//New offset array
	var offset = [d3.event.transform.x, d3.event.transform.y];

	//Calculate new scale
	var newScale = d3.event.transform.k * 2000;
    
    // TODO: Add county lines and additional power plants based on zoom level
    if (newScale >= 5000 && CURRENT_VIEW === 'state') {
        CURRENT_VIEW = 'county'
        
        
    } else if (newScale < 5000 && CURRENT_VIEW === 'county') {
        CURRENT_VIEW = 'state'
        
    }
    
	//Update projection with new offset and scale
	projection.translate(offset)
			  .scale(newScale);

	//Update all paths and circles
	svg.selectAll("path")
	   .attr("d", path);
    
	svg.selectAll("circle")
	   .attr("cx", function(d) {
	       return projection([d.longitude, d.latitude])[0];
	   })
	   .attr("cy", function(d) {
	       return projection([d.longitude, d.latitude])[1];
	   });
	   
}


// Define the zoom behavior
var zoom = d3.zoom()
			 .scaleExtent([ 0.2, 2.0 ])
			 .translateExtent([[ -1200, -700 ], [ 1200, 700 ]])
			 .on("zoom", zooming);














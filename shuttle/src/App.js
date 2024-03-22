import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import * as Constants from "./constants";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import moment from "moment";

mapboxgl.accessToken =
  "pk.eyJ1IjoicHJpbi1wIiwiYSI6ImNsdDZvbDRsdjA0cGQycXBwbDRudmw4MHYifQ.QUoBtqyiYpgWTCshcAvbkg"; //own draft style

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-71.1274); //intial location map is zoomed in on
  const [lat, setLat] = useState(42.3725);
  const [zoom, setZoom] = useState(13.95);

  //for rankings
  const [rows, setRows] = useState([{eta: "", route: "", etaInMinutes: ""}]);

  const [userChoice, setUserChoice] = useState(""); // Whether user wants to go to or come from SEC
  const userChoiceRef = useRef(userChoice);
  const [trafficMessage, setTrafficMessage] = useState(""); //Indicates traffic conditions (communicates uncertainty)

  useEffect(() => {
    userChoiceRef.current = userChoice;
  }, [userChoice]);

  //For selected route
  const [selectedShuttle, setSelectedShuttle] = useState("")

  async function getUpdates() {
    try {
      const response = await fetch("https://passio3.com/harvard/passioTransit/gtfs/realtime/tripUpdates.json");
      const data = await response.json();
      const updates = data.entity.filter(entity => Constants.trip_id_route_id.hasOwnProperty(entity.trip_update.trip.trip_id))
        .map(entity => {
          return {
            tripId: entity.trip_update.trip.trip_id,
            stopTimeUpdates: entity.trip_update.stop_time_update.map(update => ({
              stopId: update.stop_id,
              arrivalTime: update.arrival.time
            }))
          };
        });
      return updates;
    } catch (error) {
      console.error("Failed to fetch shuttle updates:", error);
      return [];
    }
  }

//Finds the closest stop to input coordinate 
async function findClosestStop(clickedLngLat) {

  let shortestOverallTime = Infinity;
  let closestStopName = "";
  let closestStopPosition = "";

  // Convert stop_pos_name keys to an array suitable for the Matrix API
  const stops = Object.keys(Constants.stop_pos_name).map(coord => encodeURIComponent(coord)).join(';');
  const userLocation = `${clickedLngLat.lng},${clickedLngLat.lat}`;

  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/walking/${userLocation};${stops}?sources=0&access_token=${mapboxgl.accessToken}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
  
    if (data.code !== "Ok") {
      console.error("Error fetching data from Mapbox Matrix API:", data.message);
      return;
    }
    const durations = data.durations[0];

    // Find the index of the shortest duration, excluding the first element
    const shortestDurationIndex = durations.slice(1).findIndex(duration => duration === Math.min(...durations.slice(1))) + 1;
    const shortestDuration = durations[shortestDurationIndex];
      
    if (shortestDuration < shortestOverallTime) {
      shortestOverallTime = shortestDuration; // Update shortestOverallTime with the new shortest duration
      closestStopPosition = Object.keys(Constants.stop_pos_name)[shortestDurationIndex - 1]; // Adjust index for the actual position in the original array
      closestStopName = Constants.stop_pos_name[closestStopPosition];
    }
  } catch (error) {
    console.error("Failed to find the closest stop:", error);
  }
  
  if (closestStopName) {
    alert(`Closest stop is ${closestStopName} with a walking time of ${Math.round(shortestOverallTime / 60)} minutes.`);
  } else {
    alert("Failed to find the closest stop.");
  }

  if (closestStopName) {
    // Return both the name and coordinates of the closest stop, along with walking time
    var stopId = Constants.name_stop_id[closestStopName]
    return { name: closestStopName, stopId: stopId, coordinates: closestStopPosition, walkingTime: Math.round(shortestOverallTime / 60), coordinatesFormatted: Constants.stop_pos_name_notString[closestStopName] };
  } else {
    throw new Error("Failed to find the closest stop.");
  }
}

//Ranks the routes in order of ETA
async function rankTrips(startStop, endStop, allTripUpdates) {
  var etas = [];
  var foundStart;
  var startStopArrival;

  //searches for start stop and end stop in the list of all stops for a shuttle
  for(let x in allTripUpdates) {
    var trip = allTripUpdates[x];
    foundStart = false;
    for(let y in trip.stopTimeUpdates){
      
      var stops = trip.stopTimeUpdates[y];
      if(stops.stopId === startStop) {
        foundStart = true;
        startStopArrival = stops.arrivalTime
      }
      if((String(stops.stopId) === String(endStop)) && foundStart) {
        etas.push({eta: stops.arrivalTime, startStopEta: startStopArrival, tripId: trip.tripId})
        break;
      }
    }
  }

  etas.sort(function(a, b) {
    return a.arrivalTime > b.arrivalTime;
  });

  return etas;
  
}

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/prin-p/clt7k1h6z001201p3eufhezul/draft",
      center: [lng, lat],
      zoom: zoom,
    });

    // Once user clicks on the map, it uses that point to find the closest stop
    map.current.on('click', async (e) => {
      const clickedLngLat = e.lngLat;
      var closestStop = await findClosestStop(clickedLngLat);

      // Target the sidebar to add the instructions
      const walkTimeHTML = document.getElementById("walkingTime");
      walkTimeHTML.innerHTML = `<p>Walk time to closest stop: ${
        closestStop.walkingTime
      }</p>`;

      var allTrips = await getUpdates();
      var ranking;
      var startStop;
      var endStop;
      if (userChoiceRef.current === 'SECStart'){
        startStop = "-71.125392617,42.363328644"
        endStop = closestStop.coordinates
        ranking = await rankTrips("58343", closestStop.stopId, allTrips)
      }
      else {
        endStop = "-71.125392617,42.363328644"
        startStop = closestStop.coordinates
        ranking = await rankTrips(closestStop.stopId, "58343", allTrips)
      }

      // Flag for if walking should be first
      var recommendWalking = false;
      var walkingTime;
      var cyclingTime;
      var ETAPlusCyclingTime;
      var ETAPlusWalkingTime;
      var parsedETAPlusCyclingTime;
      var parsedETAPlusWalkingTime;
      const coordinates = `${startStop};${endStop}`;
      const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/walking/${coordinates}?sources=1&annotations=duration&access_token=${mapboxgl.accessToken}`;
      const url2 = `https://api.mapbox.com/directions-matrix/v1/mapbox/cycling/${coordinates}?sources=1&annotations=duration&access_token=${mapboxgl.accessToken}`;

      try {
        const response = await fetch(url, { method: "GET" });
        const data = await response.json();

        if (data.durations && data.durations.length > 0 && data.durations[0].length > 1) {
          walkingTime = Math.round(data.durations[0][0] / 60); // Get the walking time from the matrix

        } else {
          console.error("Failed to get walking time from Matrix API");
        }
      } catch (error) {
        console.error("Error fetching walking time from Matrix API:", error);
      }

      try {
        const response2 = await fetch(url2, { method: "GET" });
        const data2 = await response2.json();

        if (data2.durations && data2.durations.length > 0 && data2.durations[0].length > 1) {
          cyclingTime = Math.round(data2.durations[0][0] / 60); // Get the cycling time from the matrix

        } else {
          console.error("Failed to get cycling time from Matrix API");
        }
      } catch (error) {
        console.error("Error fetching cycling time from Matrix API:", error);
      }


      var addRow = []
      for(let x in ranking) {
        var trip = ranking[x]
        var route = Constants.route_id_name[Constants.trip_id_route_id[String(trip.tripId)]]
        const ETAobject = moment(trip.eta * 1000)
        const parsed = ETAobject.format('HH:mm')
        
        const currentEpoch = moment()
        var ETAInMinutes = ETAobject.diff(currentEpoch, 'minutes')
        ETAPlusWalkingTime = currentEpoch.clone().add(walkingTime, 'minutes');
        parsedETAPlusWalkingTime = ETAPlusWalkingTime.format('HH:mm');
        ETAPlusCyclingTime = currentEpoch.clone().add(cyclingTime, 'minutes');
        parsedETAPlusCyclingTime = ETAPlusCyclingTime.format('HH:mm');

        if(ETAInMinutes > 0) {
          //Uncertainty stuff
          var tripDurationTraffic = updateRoute(startStop, endStop, Constants.route_id_uncertainty[Constants.trip_id_route_id[String(trip.tripId)]])
          
          // Compare tripDurationTraffic and subtracted ETAs
          if (tripDurationTraffic > ETAInMinutes) {
            setTrafficMessage("Traffic conditions are bad. Your shuttle may be up to 4 minutes late.");
          } else {
            setTrafficMessage("Traffic conditions are good. Your shuttle may arrive 1 to 2 minutes early.");
          }

          // Flag if walking is best
          recommendWalking = (walkingTime < tripDurationTraffic && walkingTime < ETAInMinutes);

          addRow.push({eta: parsed, route: route, etaInMinutes: `${ETAInMinutes} min`})
        }
      }

      addRow.push({eta: parsedETAPlusCyclingTime, route: "Cycling", etaInMinutes: `${cyclingTime} min`})

      if (recommendWalking) {
        addRow.unshift({eta: parsedETAPlusWalkingTime, route: "Walking", etaInMinutes: `${walkingTime} min`})
      }
      else {
        addRow.push({eta: parsedETAPlusWalkingTime, route: "Walking", etaInMinutes: `${walkingTime} min`})
      }
      
      setRows(addRow)  

    });

    // Once user interacts with a map, sets the state of the map to these new values
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on("load", async () => {
      // Get the initial location of the shuttle.
      const geojson = await getLocation();

      // Route plotting - different sources and layers for each route so it can be different colors
      map.current.addSource("routeExpress", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: Constants.dictRoute["secExpress"],
          },
        },
      });

      map.current.addSource("routeQuad", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: Constants.dictRoute["quadSECDirect"],
          },
        },
      });

      map.current.addSource("routeAllston", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: Constants.dictRoute["allstonLoop"],
          },
        },
      });

      map.current.addLayer({
        id: "routeExpress",
        type: "line",
        source: "routeExpress",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FFA23A",
          "line-width": 6,
        },
      });

      map.current.addLayer({
        id: "routeQuad",
        type: "line",
        source: "routeQuad",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#8DD7BF",
          "line-width": 4,
        },
      });

      map.current.addLayer({
        id: "routeAllston",
        type: "line",
        source: "routeAllston",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF60A8",
          "line-width": 2,
        },
      });

      //Plotting stops

      map.current.addSource("stopsExpress", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Constants.dictStops["allstonLoop"],
        },
      });

      map.current.addLayer({
        id: "stopsExpress",
        type: "circle",
        source: "stopsExpress",
        paint: {
          "circle-radius": 8,
          "circle-color": "#FFA23A",
        },
      });

      map.current.addSource("stopsQuad", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Constants.dictStops["quadSECDirect"],
        },
      });

      map.current.addLayer({
        id: "stopsQuad",
        type: "circle",
        source: "stopsQuad",
        paint: {
          "circle-radius": 7,
          "circle-color": "#8DD7BF",
        },
      });

      map.current.addSource("stopsAllston", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: Constants.dictStops["secExpress"],
        },
      });

      map.current.addLayer({
        id: "stopsAllston",
        type: "circle",
        source: "stopsAllston",
        paint: {
          "circle-radius": 6,
          "circle-color": "#FF60A8",
        },
      });

      // Add the shuttle location as a source.
      map.current.addSource("shuttle", {
        type: "geojson",
        data: geojson,
      });

      //Shows shuttles that are live 
      map.current.addLayer({
        id: "shuttle",
        type: 'symbol',
        source: "shuttle",
        layout: {
          'icon-image': 'noun-bus-31771',
          'icon-size': 0.3
        }
      });

      // Update the source from the API every 2 seconds.
      const updateSource = setInterval(async () => {
        const geojson = await getLocation(updateSource);
        map.current.getSource("shuttle").setData(geojson);
      }, 2000);

      async function getLocation(updateSource) {
        // Make a GET request to the API and return the location of the ISS.
        try {
          const response = await fetch(
            "https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json",
            { method: "GET" }
          );
          const obj = await response.json();
          const entity = obj.entity;
          var featuresList = [];

          //For loop for each entity (i.e. shuttle) and filters to just our routes.
          // For loop gets all longitude and latitude position of each shuttle
          for (let x in entity) {
            var shuttle = entity[x];
            var tripId = shuttle.vehicle.trip.trip_id;

            //Check if shuttle is in desired route
            if (tripId in Constants.trip_id_route_id) {
              var coord = [
                shuttle.vehicle.position.longitude,
                shuttle.vehicle.position.latitude,
              ];

              featuresList.push({
                type: "Feature",
                properties: {
                  id: tripId, //added trip id so will be able to filter features and color the shuttle we're recommending
                },
                geometry: {
                  type: "Point",
                  coordinates: coord,
                },
              });
            }
          }
          // Return the location of the shuttle as GeoJSON.
          return {
            type: "FeatureCollection",
            features: featuresList, //list of features, can add multiple marker geojsons here
          };
        } catch (err) {
          // If the updateSource interval is defined, clear the interval to stop updating the source.
          if (updateSource) clearInterval(updateSource);
          throw new Error(err);
        }
      }
    });
  });

  //Traffic (for uncertainty) functions
  // Inputs: startStop coordinate (format "long,lat"), endStop coordinate, route (name, String)
  async function updateRoute(startStop, endStop, route) {
    //Make button to test this

    // Set the profile
    const profile = "driving-traffic"; //times informed by traffic data

    // Get the coordinates of the route using the inputs
    const routeCoordinates = Constants.dictRouteString[route]; // all coordinates of a route
    const startStopIndex = routeCoordinates.indexOf(startStop); // index of the start coord in the array
    const endStopIndex = routeCoordinates.indexOf(endStop); // index of the end coord in the array
    var numCoordinates = endStopIndex - startStopIndex; // num of coords between start and stop coord
    const totalCoords = routeCoordinates.length;
    if (numCoordinates < 0) {
      numCoordinates = totalCoords - startStopIndex + (endStopIndex + 1);
    }
    var testArray = Constants.dictRoute[route].slice(startStopIndex, endStopIndex)
    
    // Add a new layer to the map - shows route that the user will travel in the shuttle
    map.current.addLayer({
      id: 'routeTest2',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: "LineString",
            coordinates:testArray,
          },
        }
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#038888',
        'line-width': 20,
        'line-opacity': 0.8
      }
    });

    var newCoords = ""; //List of coords
    var curIndex = startStopIndex;
    var curCoord;
    var count = numCoordinates; // number of coordinates added to list for API call
    var skipCoords = 1;
    if (count > 100) {
      //100 is the max number of coords allowed in API call
      count = 100; // number of coordinates added to list
      //skipCoords is the number of coords we'll skip (i.e. not include in the API call)
      skipCoords = Math.ceil(numCoordinates / 100); //TEST if about correct number
    }

    // Looping through to get coordinates for API call and formatting them
    var radius = ""; //For API call, same number of radii as coordinates

    //alert(count)
    for (let i = 0; i < count; i++) {
      curCoord = routeCoordinates[curIndex];
      if (i === count-1){
        newCoords =
          newCoords + curCoord;

        // Set the radius for each coordinate pair to 10 meters
        radius = radius + "10";
      } else {
        newCoords =
          newCoords + curCoord + ";";
        
          // Set the radius for each coordinate pair to 10 meters
        radius = radius + "10;";
      } 
      
      curIndex = curIndex + skipCoords;
      if (curIndex >= totalCoords) {
        curIndex = 0;
      }

     
    }

    var tripDurationTraffic = await getMatch(newCoords, radius, profile); //Calls function to call API
    var tripDuration = await getMatch(newCoords, radius, "driving"); //Calls function to call API (car without traffic)

    return tripDurationTraffic;

  }

  // Make a Map Matching request
  async function getMatch(coordinates, radiuses, profile) {
    // Create the query
    const query = await fetch(
      `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?radiuses=${radiuses}&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    const response = await query.json();
    // Handle errors
    if (response.code !== "Ok") {
      alert(
        `${response.code} - ${response.message}.\n\nFor more information: https://docs.mapbox.com/api/navigation/map-matching/#map-matching-api-errors`
      );
      return;
    }
    // Get the coordinates from the response
    const coords = response.matchings[0].geometry;
    console.log(coords);

    //Get trip duration
    var data = response.matchings[0];
    
    //Show trip duration
    var tripDuration = Math.ceil(data.duration / 60);
    return tripDuration
    
  }

  return (
    <div>
      {/* Displays center coordinates of map */}
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>

      {/* Displays map */}
      <div ref={mapContainer} className="map-container" />

      {/* Sidebar for info */}
      <div class="info-box">
        <p>
          Choose whether you want your start or destination stop to be the SEC. Then, click on the map to enter your other stop.
        </p>
        <div>
          <input type="radio" id="secStart" name="secPosition" value="SECStart" onChange={() => {setUserChoice("SECStart")}} />
          <label htmlFor="secStart">SEC as Start</label>
          <input type="radio" id="secEnd" name="secPosition" value="SECEnd" onChange={() => setUserChoice("SECEnd")} />
          <label htmlFor="secEnd">SEC as End</label>
        </div>

        <div>
          <p>{trafficMessage}</p> {/* Display the traffic message here */}
        </div>
        
        <div id="directions"></div>
        <div id="tripRankings">
          <TableContainer component={Paper}>
          <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>ETA at destination</TableCell>
                <TableCell align="right">ETA in minutes</TableCell>
                <TableCell align="right">Route</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.route}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.eta}
                  </TableCell>
                  <TableCell align="right">{
                    row.etaInMinutes
                  }</TableCell>
                  <TableCell align="right">{
                    row.route
                  }</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>

        <div id="walkingTime"></div>
      </div>
    </div>
  );
}
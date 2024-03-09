import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import shapesRaw from './textFiles/shapesSecOnly.txt';  
import * as Constants from './constants'

mapboxgl.accessToken = 'pk.eyJ1IjoicHJpbi1wIiwiYSI6ImNsdDZwZGFpZDBlM2syanA2dmhlbnJwdTMifQ.bhuhjb9c4DrY7m8pOScJpw';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-71.1274); //intial location map is zoomed in on
  const [lat, setLat] = useState(42.3725);
  const [zoom, setZoom] = useState(13.95);

  //For traffic data (uncertainty)
  const [trafficConditions, setTraffic] = useState(null)

  useEffect(() => {
    if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1', //like 'mapbox://styles/mapbox/navigation-day-v1'
        //this could also be good, very minimalistic but kinda hurts eyes mapbox://styles/mapbox/light-v11
        center: [lng, lat],
        zoom: zoom
      });

    // Once user interacts with a map, sets the state of the map to these new values
    map.current.on('move', () => { 
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    map.current.on('load', async () => {
      // Get the initial location of the shuttle.
      const geojson = await getLocation();
      //const routeCoordinates = await getRouteCoordinates();

      // Route plotting - different sources and layers for each route so it can be different colors
      map.current.addSource('routeExpress', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': Constants.dictRoute['secExpress']
            }
        }
      }); 

      map.current.addSource('routeQuad', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': Constants.dictRoute['quadSECDirect']
            }
        }
      }); 

      map.current.addSource('routeAllston', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': Constants.dictRoute['allstonLoop']
            }
        }
      }); 

      map.current.addLayer({
          'id': 'routeExpress',
          'type': 'line',
          'source': 'routeExpress',
          'layout': {
              'line-join': 'round',
              'line-cap': 'round'
          },
          'paint': {
              'line-color': '#FFA23A',
              'line-width': 6
          }
      });

      map.current.addLayer({
        'id': 'routeQuad',
        'type': 'line',
        'source': 'routeQuad',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#8DD7BF',
            'line-width': 4
        }
    });

    map.current.addLayer({
      'id': 'routeAllston',
      'type': 'line',
      'source': 'routeAllston',
      'layout': {
          'line-join': 'round',
          'line-cap': 'round'
      },
      'paint': {
          'line-color': '#FF60A8',
          'line-width': 2
      }
  });

  //Plotting stops

  map.current.addSource('stopsExpress', {
    'type': 'geojson',
    'data': {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.119075,42.364114]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.127741708,42.363958424]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.119965,42.372722]
                }
            },
            {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.120985,42.371524]
              }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.124887448,42.367121429]
              }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.114510008,42.374634042]
              }
          },
          {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.115008,42.37288]
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.116713434,42.370083645]
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.125392617,42.363328644]
            }
        }
        ]
    }
  });

  map.current.addLayer({
    'id': 'stopsExpress',
    'type': 'circle',
    'source': 'stopsExpress',
    'paint': {
        'circle-radius': 8,
        'circle-color': '#FFA23A'
    }
  });

  map.current.addSource('stopsQuad', {
    'type': 'geojson',
    'data': {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.127741708,42.363958424]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.119965,42.372722]
                }
            },
            {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.120985,42.371524]
              }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.124887448,42.367121429]
              }
          },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.125392617,42.363328644]
            }
        },
        {
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': [-71.119937392,42.377977084]
          }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.125325,42.381867]
              }
          },
          {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.12212,42.3765]
            }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.119467061,42.375187466]
              }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.119734232,42.373378883]
              }
          },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.121339,42.371203]
            }
        },
        {
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': [-71.125015193,42.367024629]
          }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.127861727,42.363936034]
            }
        }
      ]
    }
  });

  map.current.addLayer({
    'id': 'stopsQuad',
    'type': 'circle',
    'source': 'stopsQuad',
    'paint': {
        'circle-radius': 7,
        'circle-color': '#8DD7BF'
    }
  });


  map.current.addSource('stopsAllston', {
    'type': 'geojson',
    'data': {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.119075,42.364114]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.127741708,42.363958424]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.119965,42.372722]
                }
            },
            {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.120985,42.371524]
              }
          },
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': [-71.124887448,42.367121429]
              }
          },
          {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.115008,42.37288]
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.116713434,42.370083645]
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-71.125392617,42.363328644]
            }
        },


            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.119937392,42.377977084]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.11663,42.378933]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.115974486,42.376901687]
                }
            },
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [-71.114392997,42.37645186]
                }
            },
        ]
    }
  });

  map.current.addLayer({
    'id': 'stopsAllston',
    'type': 'circle',
    'source': 'stopsAllston',
    'paint': {
        'circle-radius': 6,
        'circle-color': '#FF60A8'
    }
  });

      // Load an image from an external URL.
      map.current.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/cat.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.current.addImage('shuttleImg', image);

            // Add the shuttle location as a source.
            map.current.addSource('shuttle', {
                'type': 'geojson',
                'data': geojson });

            //Shows shuttles that are live but we don't recommend
            map.current.addLayer({
              'id': 'shuttle',
              'type': 'circle',
              //'type': 'symbol',
              'source': 'shuttle',
              'paint': {
                    'circle-radius': 8,
                    'circle-color': '#FFFFFF'
                },
                'filter': ['!=', 'id', "670358"] //HARDCODED //Filter to only show particular features
              //'layout': {
                  // This icon is a part of the Mapbox Streets style.
                  // To view all images available in a Mapbox style, open
                  // the style in Mapbox Studio and click the "Images" tab.
                  // To add a new image to the style at runtime see
                  // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                  //'icon-image': 'shuttleImg' //change to actual icon
              //}
          });

          // Shows shuttle that we recommend user taking
            map.current.addLayer({
                'id': 'shuttleHighlighted',
                'type': 'circle',
                //'type': 'symbol',
                'source': 'shuttle',
                'paint': {
                    'circle-radius': 8,
                    'circle-color': '#F32FFF'
                },
                'filter': ['==', 'id', "670358"] //HARDCODED CHANGE ID VAL To an updated state val
                //'layout': {
                    // This icon is a part of the Mapbox Streets style.
                    // To view all images available in a Mapbox style, open
                    // the style in Mapbox Studio and click the "Images" tab.
                    // To add a new image to the style at runtime see
                    // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                    //'icon-image': 'shuttleImg' //change to actual icon
                //}
            });
        }
      );

      // Update the source from the API every 2 seconds.
      const updateSource = setInterval(async () => {
          const geojson = await getLocation(updateSource);
          map.current.getSource('shuttle').setData(geojson);
      }, 2000);

      async function getLocation(updateSource) {
          // Make a GET request to the API and return the location of the ISS.
          try {
              const response = await fetch(
                  'https://passio3.com/harvard/passioTransit/gtfs/realtime/vehiclePositions.json',
                  { method: 'GET' }
              );
              const obj =  await response.json();
              const entity = obj.entity
              var featuresList = []

              //For loop for each entity (i.e. shuttle) and filters to just our routes. 
              // For loop gets all longitude and latitude position of each shuttle
              for (let x in entity) { 
                var shuttle = entity[x]
                var tripId = shuttle.vehicle.trip.trip_id

                //Check if shuttle is in desired route
                if (tripId === "670358") { // HARDCODED NEED TO CHANGE TO ACTUAL TRIP IDs
                    var coord = [shuttle.vehicle.position.longitude, shuttle.vehicle.position.latitude] 

                    featuresList.push(
                        {
                          'type': 'Feature',
                          'properties' : {
                            'id':tripId //added trip id so will be able to filter features and color the shuttle we're recommending
                          },
                          'geometry': {
                              'type': 'Point',
                              'coordinates': coord
                          }
                      }
                    )
                }
              }
              // Return the location of the shuttle as GeoJSON.
              return {
                  'type': 'FeatureCollection',
                  'features': featuresList //list of features, can add multiple marker geojsons here
              };
          } catch (err) {
              // If the updateSource interval is defined, clear the interval to stop updating the source.
              if (updateSource) clearInterval(updateSource);
              throw new Error(err);
          }
      }

      //Traffic (for uncertainty) functions
      // Inputs: startStop coordinate (format [long,lat]), endStop coordinate, route (name, String)
        function updateRoute(startStop, endStop, route) { //Make button to test this

            // Set the profile
            const profile = 'driving-traffic'; //times informed by traffic data
            
            // Get the coordinates of the route using the inputs
            const routeCoordinates = Constants.dictRoute[route]; // all coordinates of a route
            const startStopIndex = routeCoordinates.indexOf(startStop) // index of the start coord in the array
            const endStopIndex = routeCoordinates.indexOf(endStop) // index of the end coord in the array
            var numCoordinates = endStopIndex - startStopIndex; // num of coords between start and stop coord
            const totalCoords = routeCoordinates.length
            if (numCoordinates < 0) {
                numCoordinates = (totalCoords - startStopIndex) + (endStopIndex + 1)
            }

            var newCoords = '' //List of coords
            var curIndex = startStopIndex
            var curCoord;
            var count = numCoordinates // number of coordinates added to list for API call
            var skipCoords = 1
            if (count > 100){ //100 is the max number of coords allowed in API call
                count = 100 // number of coordinates added to list
                //skipCoords is the number of coords we'll skip (i.e. not include in the API call)
                skipCoords = Math.ceil(numCoordinates / 100); //TEST if about correct number
            }

            // Looping through to get coordinates for API call and formatting them
            var radius = '' //For API call, same number of radii as coordinates
            
            for (let i = 0; i < count; i++) {
                curCoord = routeCoordinates[curCoord]
                newCoords = newCoords + curCoord[0].toString() + ',' + curCoord[1].toString() + ';'
                curIndex = curIndex + skipCoords
                if (curIndex >=totalCoords){
                    curIndex = 0
                }

                // Set the radius for each coordinate pair to 10 meters
                radius = radius + '10;'
            }        
            
            getMatch(newCoords, radius, profile); //Calls function to call API

            /*
            var newCoords = '' //List of coords
            var curIndex = startStopIndex
            var curCoord;
            if (numCoordinates > 100){ //100 is the max number of coords allowed in API call
                //skipCoords is the number of coords we'll skip (not include in the API call)
                var skipCoords = Math.ceil(numCoordinates / 100); //TEST if about correct number

                // Looping through to get coordinates for API call
                for (let i = 0; i < 100; i++) {
                    curCoord = routeCoordinates[curCoord]
                    newCoords = newCoords + curCoord[0].toString() + ',' + curCoord[1].toString() + ';'
                    curIndex = curIndex + skipCoords
                    if (curIndex >=totalCoords){
                        curIndex = 0
                    }
                }
            } else {
                // Looping through to get coordinates for API call and formatting them
                for (let i = 0; i < numCoordinates; i++) {
                    curCoord = routeCoordinates[curCoord]
                    newCoords = newCoords + curCoord[0].toString() + ',' + curCoord[1].toString() + ';'
                    curIndex +=1
                    if (curIndex >=totalCoords){
                        curIndex = 0
                    }
                }
            }
            */
            
        }

        // Make a Map Matching request
        async function getMatch(coordinates, radiuses, profile) {
            
            // Create the query
            const query = await fetch(
            `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinates}?geometries=geojson&radiuses=${radiuses}&steps=false&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
            );
            const response = await query.json();
            // Handle errors
            if (response.code !== 'Ok') {
            alert(
                `${response.code} - ${response.message}.\n\nFor more information: https://docs.mapbox.com/api/navigation/map-matching/#map-matching-api-errors`
            );
            return;
            }
            // Get the coordinates from the response
            const coords = response.matchings[0].geometry;
            console.log(coords);
            
            //Get trip duration
            var data = response.matchings[0]
            // Target the sidebar to add the instructions
            const directions = document.getElementById('directions');
            //Show trip duration
            var tripDuration = Math.floor(data.duration / 60);
            directions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
                data.duration / 60
              )} min.</strong></p>`;
        }

    });
});

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
            Draw your route using the draw tools on the right. To get the most
            accurate route match, draw points at regular intervals.
        </p>
        <div id="directions"></div>
      </div>
    </div>
  );
  
}


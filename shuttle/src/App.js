import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import shapesRaw from './textFiles/shapesSecOnly.txt';  
import * as Constants from './constants'

mapboxgl.accessToken = 'pk.eyJ1IjoicHJpbi1wIiwiYSI6ImNsdDZwZGFpZDBlM2syanA2dmhlbnJwdTMifQ.bhuhjb9c4DrY7m8pOScJpw';

export default function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-71.1); //intial location map is zoomed in on
  const [lat, setLat] = useState(42.36);
  const [zoom, setZoom] = useState(13);

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

  /* FOR TESTING ONLY
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
        ]
    }
  }); */



      // SHUTTLE PLOTTING
      /*
      // Add the shuttle location as a source.
      map.current.addSource('shuttle', {
          type: 'geojson',
          data: geojson
      }); */

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

            map.current.addLayer({
              'id': 'shuttle',
              'type': 'symbol',
              'source': 'shuttle',
              'layout': {
                  // This icon is a part of the Mapbox Streets style.
                  // To view all images available in a Mapbox style, open
                  // the style in Mapbox Studio and click the "Images" tab.
                  // To add a new image to the style at runtime see
                  // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
                  'icon-image': 'shuttleImg' //change to actual icon
              }
          });
        }
      );

    /*
      // Add the rocket symbol layer to the map.
      map.current.addLayer({
          'id': 'shuttle',
          'type': 'symbol',
          'source': 'shuttle',
          'layout': {
              // This icon is a part of the Mapbox Streets style.
              // To view all images available in a Mapbox style, open
              // the style in Mapbox Studio and click the "Images" tab.
              // To add a new image to the style at runtime see
              // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
              'icon-image': 'rocket'
          }
      });*/

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

              //var coordinates = []
              var featuresList = []

              //For loop for each entity (i.e. shuttle) and filters to just our routes. 
              // For loop gets all longitude and latitude position of each shuttle
              for (let x in entity) { //key is shuttle THINK THIS FOR LOOP DOESN"T WORK
                //alert(entity)
                //Check if shuttle is in desired route
                var shuttle = entity[x]
                //alert(shuttle)
                //alert(shuttle.vehicle)
                var tripId = shuttle.vehicle.trip.trip_id
                //alert(tripId)

                if (tripId === "670551" || tripId === "661305") {
                    var coord = [shuttle.vehicle.position.latitude, shuttle.vehicle.position.longitude] //works
                   //coordinates.push(coord)
                    /*var featureObj = {
                          'type': 'Feature',
                          'geometry': {
                              'type': 'Point',
                              'coordinates': coord
                          }
                      }*/
                    //alert(featureObj)

                    //featuresList.push(featureObj)
                    featuresList.push(
                        {
                          'type': 'Feature',
                          'geometry': {
                              'type': 'Point',
                              'coordinates': coord
                          }
                      }
                    )
                }
              }
              
              return {
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
                ]
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
    </div>
  );
  
}


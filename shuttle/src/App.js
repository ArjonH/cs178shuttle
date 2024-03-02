import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import shapesRaw from './textFiles/shapesSecOnly.txt';  


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
      const routeCoordinates = await getRouteCoordinates();
      alert(shapesRaw)

      /*map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [
                          [-122.483696, 37.833818],
                          [-122.483482, 37.833174],
                          [-122.483396, 37.8327],
                          [-122.483568, 37.832056],
                          [-122.48404, 37.831141],
                          [-122.48404, 37.830497],
                          [-122.483482, 37.82992],
                          [-122.483568, 37.829548],
                          [-122.48507, 37.829446],
                          [-122.4861, 37.828802],
                          [-122.486958, 37.82931],
                          [-122.487001, 37.830802],
                          [-122.487516, 37.831683],
                          [-122.488031, 37.832158],
                          [-122.488889, 37.832971],
                          [-122.489876, 37.832632],
                          [-122.490434, 37.832937],
                          [-122.49125, 37.832429],
                          [-122.491636, 37.832564],
                          [-122.492237, 37.833378],
                          [-122.493782, 37.833683]
                      ]
                    }
                },
                {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'LineString',
                      'coordinates': [
                        [-122.483696, 37.833818],
                        [-122.483482, 37.833174],
                        [-122.483396, 37.8327],
                        [-122.483568, 37.832056],
                        [-122.48404, 37.831141],
                        [-122.48404, 37.830497],
                        [-122.483482, 37.82992],
                        [-122.483568, 37.829548],
                        [-122.48507, 37.829446],
                        [-122.4861, 37.828802],
                        [-122.486958, 37.82931],
                        [-122.487001, 37.830802],
                        [-122.487516, 37.831683],
                        [-122.488031, 37.832158],
                        [-122.488889, 37.832971],
                        [-122.489876, 37.832632],
                        [-122.490434, 37.832937],
                        [-122.49125, 37.832429],
                        [-122.491636, 37.832564],
                        [-122.492237, 37.833378],
                        [-122.493782, 37.833683]
                    ]
                  }
                },
                {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'LineString',
                      'coordinates': [
                        [-122.483696, 37.833818],
                        [-122.483482, 37.833174],
                        [-122.483396, 37.8327],
                        [-122.483568, 37.832056],
                        [-122.48404, 37.831141],
                        [-122.48404, 37.830497],
                        [-122.483482, 37.82992],
                        [-122.483568, 37.829548],
                        [-122.48507, 37.829446],
                        [-122.4861, 37.828802],
                        [-122.486958, 37.82931],
                        [-122.487001, 37.830802],
                        [-122.487516, 37.831683],
                        [-122.488031, 37.832158],
                        [-122.488889, 37.832971],
                        [-122.489876, 37.832632],
                        [-122.490434, 37.832937],
                        [-122.49125, 37.832429],
                        [-122.491636, 37.832564],
                        [-122.492237, 37.833378],
                        [-122.493782, 37.833683]
                    ]
                  }
                }
            ]
        }
      }); */

      // Route plotting
      map.current.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': routeCoordinates['secExpress']
            }
        }
      }); 

      map.current.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
              'line-join': 'round',
              'line-cap': 'round'
          },
          'paint': {
              'line-color': '#203333',
              'line-width': 15
          }
      });


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
              type: 'geojson',
              data: geojson
            });
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
                  'icon-image': 'shuttleImg'
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

      async function getRouteCoordinates(){
        //Returns point coordinates for a route shape as an object of an array of coordinates
        //Key of object is the route name, value is the array of coordinates
        // Coordinates format [lat, long]

        var dict = {
          'allstonLoop': [],
          'quadSECDirect': [],
          'secExpress': []
        }
        
        // Load coordinates from shapes text file
        


        //hard coded for now
        return { 
          'secExpress':
            [
              [-122.483696, 37.833818],
              [-122.483482, 37.833174],
              [-122.483396, 37.8327],
              [-122.483568, 37.832056],
              [-122.48404, 37.831141],
              [-122.48404, 37.830497],
              [-122.483482, 37.82992],
              [-122.483568, 37.829548],
              [-122.48507, 37.829446],
              [-122.4861, 37.828802],
              [-122.486958, 37.82931],
              [-122.487001, 37.830802],
              [-122.487516, 37.831683],
              [-122.488031, 37.832158],
              [-122.488889, 37.832971],
              [-122.489876, 37.832632],
              [-122.490434, 37.832937],
              [-122.49125, 37.832429],
              [-122.491636, 37.832564],
              [-122.492237, 37.833378],
              [-122.493782, 37.833683]
            ]
        };
      }

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
              //alert(await response.json())
              const obj =  await response.json();
              //alert(JSON.stringify(obj))
              const entity = obj.entity
              //alert(entity)
              const shuttle1 = entity[0] //only get info on first shuttle for now
              //alert(JSON.stringify(shuttle1))
              const latitude = shuttle1.vehicle.position.latitude
              const longitude = shuttle1.vehicle.position.longitude //works

              // Return the location of the shuttle as GeoJSON.
              return {
                  'type': 'FeatureCollection',
                  'features': [ //list of features, can add multiple marker geojsons here
                      {
                          'type': 'Feature',
                          'geometry': {
                              'type': 'Point',
                              'coordinates': [longitude, latitude]
                          }
                      }
                  ]
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


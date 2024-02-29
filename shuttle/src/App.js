import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

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

              //Take flyTo out since don't want to follow shuttles
              // Fly the map to the location.
              map.current.flyTo({
                  center: [longitude, latitude],
                  speed: 0.5
              }); 

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


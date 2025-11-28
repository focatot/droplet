// All Mapbox responsibilities live here: map + geocoder wiring, reverse geocode, and browser geolocation helpers.
import { CONFIG, DEFAULT_LOCATION } from './config.js';

export function createMapController({
  mapboxToken,
  defaultCenter = [139.7263785, 35.6652064],
  defaultZoom = 10,
  onLocationSelected,
}) {
  if (!mapboxToken) {
    throw new Error('Mapbox token is required to initialize the map.');
  }

  mapboxgl.accessToken = mapboxToken;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: defaultCenter,
    zoom: defaultZoom,
  });

  map.on('load', () => {
    map.resize();
  });

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxToken,
    mapboxgl,
    language: 'en',
    marker: false,
    types: 'place',
  });

  geocoder.on('result', (event) => {
    const [lng, lat] = event.result.geometry.coordinates;
    if (onLocationSelected) {
      onLocationSelected({ lng, lat, source: 'geocoder', placeName: event.result.place_name });
    }
    geocoder.setInput('');
  });

  map.on('click', (event) => {
    const { lng, lat } = event.lngLat;
    if (onLocationSelected) {
      onLocationSelected({ lng, lat, source: 'map' });
    }
  });

  const geocoderContainer = document.getElementById('geocoder');
  if (geocoderContainer) {
    geocoderContainer.appendChild(geocoder.onAdd(map));
  }

  function flyTo(lng, lat) {
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), defaultZoom) });
  }

  return { map, flyTo };
}

export async function reverseGeocode({ lng, lat }) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${CONFIG.MAPBOX_TOKEN}&language=en`
  );
  if (!response.ok) throw new Error('Failed to fetch location data.');

  const data = await response.json();
  const feature = data.features?.[0];
  if (!feature) return DEFAULT_LOCATION.label;

  const context = feature.context || [];
  const city = context.find((item) => item.id.includes('place'))?.text || feature.text;
  const country = context.find((item) => item.id.includes('country'))?.text || '';
  const label = [city, country].filter(Boolean).join(', ') || feature.place_name;
  return label || DEFAULT_LOCATION.label;
}

export async function getBrowserLocation() {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lng: position.coords.longitude, lat: position.coords.latitude }),
      () => resolve(null)
    );
  });
}

import { createMapController, reverseGeocode, getBrowserLocation } from './mapbox.js';
import { CONFIG, DEFAULT_LOCATION } from './config.js';
import { fetchWeatherAndForecast } from './openweather.js';
import { createRenderer } from './render.js';

const elements = {
  cityName: document.getElementById('cityName'),
  descriptor: document.getElementById('descriptor'),
  currentTemp: document.getElementById('currentTemp'),
  minTemp: document.getElementById('minTemp'),
  maxTemp: document.getElementById('maxTemp'),
  feelsLike: document.getElementById('feelsLike'),
  currentHumid: document.getElementById('currentHumid'),
  windSpd: document.getElementById('windSpd'),
  cloudiness: document.getElementById('cloudiness'),
  risenset: document.getElementById('risenset'),
  pressure: document.getElementById('pressure'),
  uvi: document.getElementById('uvi'),
  visibility: document.getElementById('visibility'),
  hourlyForecast: document.getElementById('hourly-forecast'),
  dailyForecast: document.getElementById('daily-forecast'),
};

const renderer = createRenderer(elements);

class WeatherApp {
  constructor() {
    this.mapController = createMapController({
      mapboxToken: CONFIG.MAPBOX_TOKEN,
      defaultCenter: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
      defaultZoom: 10,
      onLocationSelected: (location) => this.loadLocation(location),
    });
  }

  async init() {
    const userLocation = await getBrowserLocation();
    const startLocation = userLocation || { lng: DEFAULT_LOCATION.lng, lat: DEFAULT_LOCATION.lat };
    await this.loadLocation({ ...startLocation, source: 'initial' });
  }

  async loadLocation({ lng, lat, source }) {
    try {
      const locationLabel = await reverseGeocode({ lng, lat });
      const { weather, forecastList } = await fetchWeatherAndForecast({ lng, lat });

      renderer.renderCurrent(weather, locationLabel);
      renderer.renderHourly(weather.hourly);
      renderer.renderDaily(forecastList);

      this.mapController.flyTo(lng, lat);

      console.log(`Weather fetched for ${locationLabel} via ${source || 'unknown'} @ ${lng}, ${lat}`);
    } catch (error) {
      console.error('Error fetching or rendering weather forecast:', error);
      elements.cityName.innerHTML = '<p>Unable to load weather right now.</p>';
    }
  }
}

const app = new WeatherApp();
app.init();

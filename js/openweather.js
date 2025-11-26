import { CONFIG } from './config.js';

export async function fetchWeatherAndForecast({ lng, lat }) {
  const params = new URLSearchParams({ lng, lat }).toString();
  const base = CONFIG.API_BASE?.replace(/\/+$/, '') || '';
  const url = `${base}/api/weather?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather or forecast data.');
  }

  const { weather, forecastList } = await response.json();
  return { weather, forecastList: forecastList || [] };
}

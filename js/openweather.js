import { CONFIG } from './config.js';

export async function fetchWeatherAndForecast({ lng, lat }) {
  const params = `lat=${lat}&lon=${lng}&appid=${CONFIG.OPEN_WEATHER_TOKEN}&units=metric`;
  const [oneCallResponse, forecastResponse] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/3.0/onecall?${params}`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
  ]);

  if (!oneCallResponse.ok || !forecastResponse.ok) {
    throw new Error('Failed to fetch weather or forecast data.');
  }

  const [weather, forecast] = await Promise.all([oneCallResponse.json(), forecastResponse.json()]);
  return { weather, forecastList: forecast.list || [] };
}

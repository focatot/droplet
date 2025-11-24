const formatters = {
  hour(unixSeconds) {
    return new Date(unixSeconds * 1000).toLocaleTimeString([], { hour: 'numeric' });
  },
  weekday(unixSeconds) {
    return new Date(unixSeconds * 1000).toLocaleDateString('en-US', { weekday: 'short' });
  },
};

function setContent(element, html) {
  if (element) element.innerHTML = html;
}

function getTodayRange(weatherData) {
  const today = weatherData?.daily?.[0]?.temp;
  if (!today) return null;
  return {
    min: Math.round(today.min),
    max: Math.round(today.max),
  };
}

export function createRenderer(elements) {
  function renderCurrent(weatherData, locationLabel) {
    const { current } = weatherData;
    const todayRange = getTodayRange(weatherData);

    setContent(elements.cityName, `<p>${locationLabel}</p>`);
    setContent(elements.descriptor, `<p>${current.weather?.[0]?.description || ''}</p>`);
    setContent(elements.currentTemp, `<p>${current.temp.toFixed(0)}&deg;C</p>`);
    if (todayRange) {
      setContent(elements.minTemp, `<p>Min:</br>${todayRange.min}&deg;C</p>`);
      setContent(elements.maxTemp, `<p>Max:</br>${todayRange.max}&deg;C</p>`);
    }
    setContent(elements.feelsLike, `<p>Feels Like:</br>${current.feels_like.toFixed(0)}&deg;C</p>`);
    setContent(elements.currentHumid, `<p>Humidity:</br>${current.humidity}%</p>`);
    setContent(elements.windSpd, `<p>Wind Speed:</br>${current.wind_speed.toFixed(0)} m/s</p>`);
    setContent(elements.cloudiness, `<p>Cloudiness:</br>${current.clouds}%</p>`);

    const sunriseTime = new Date(current.sunrise * 1000).toLocaleTimeString();
    const sunsetTime = new Date(current.sunset * 1000).toLocaleTimeString();
    setContent(elements.risenset, `<p>Sunrise:</br>${sunriseTime}</p><p>Sunset:</br>${sunsetTime}</p>`);

    setContent(elements.pressure, `<p>Pressure:</br>${current.pressure} hPa</p>`);
    setContent(elements.uvi, `<p>UV:</br>${current.uvi}</p>`);
    setContent(elements.visibility, `<p>Visibility:</br>${(current.visibility / 1000).toFixed(1)} km</p>`);
  }

  function renderHourly(hourly = []) {
    const container = elements.hourlyForecast;
    if (!container) return;

    container.innerHTML = '';
    hourly.slice(0, 24).forEach((hour) => {
      const weatherIcon = `http://openweathermap.org/img/wn/${hour.weather?.[0]?.icon}.png`;
      const card = document.createElement('div');
      card.classList.add('hourly-card');
      card.innerHTML = `
        <div class="hourly-time">${formatters.hour(hour.dt)}</div>
        <img class="hourly-icon" src="${weatherIcon}" alt="${hour.weather?.[0]?.description || ''}">
        <div class="hourly-temp">${hour.temp.toFixed(0)}&deg;</div>
      `;
      container.appendChild(card);
    });
  }

  function renderDaily(forecastList = []) {
    const container = elements.dailyForecast;
    if (!container) return;

    container.innerHTML = '';
    const groupedByDay = forecastList.reduce((grouped, forecast) => {
      const day = new Date(forecast.dt * 1000).toISOString().split('T')[0];
      grouped[day] = grouped[day] || [];
      grouped[day].push(forecast);
      return grouped;
    }, {});

    Object.values(groupedByDay)
      .slice(0, 5)
      .forEach((dayForecasts) => {
        const { dt, main, weather } = dayForecasts[0];
        const weatherIcon = `http://openweathermap.org/img/wn/${weather?.[0]?.icon}.png`;
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
          <div class="daily-forecast-child" id="date-time">${formatters.weekday(dt)}</div>
          <img class="daily-forecast-child" src="${weatherIcon}" alt="${weather?.[0]?.description || ''}">
          <div class="daily-forecast-child" id="temperature">${main.temp.toFixed(0)}&deg;</div>
        `;
        container.appendChild(card);
      });
  }

  return { renderCurrent, renderHourly, renderDaily };
}

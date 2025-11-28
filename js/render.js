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

function formatDescription(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function describeCloudiness(percent) {
  const value = Number.isFinite(percent) ? Math.round(percent) : 0;
  if (value <= 10) return { label: 'Clear', value };
  if (value <= 30) return { label: 'Few clouds', value };
  if (value <= 60) return { label: 'Scattered clouds', value };
  if (value <= 85) return { label: 'Mostly cloudy', value };
  return { label: 'Overcast', value };
}

function describeVisibility(meters) {
  const km = Math.max(0, Math.round((meters || 0) / 1000));
  if (km >= 10) return { label: 'Perfectly clear', km };
  if (km >= 8) return { label: 'Clear views', km };
  if (km >= 5) return { label: 'Good visibility', km };
  if (km >= 3) return { label: 'A bit hazy', km };
  return { label: 'Low visibility', km };
}

function describePressure(hpa) {
  const value = Math.round(hpa || 0);
  if (value < 1005) return { label: 'Low', value };
  if (value > 1025) return { label: 'High', value };
  return { label: 'Normal', value };
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
    const description = formatDescription(current.weather?.[0]?.description);

    setContent(elements.cityName, `<p>${locationLabel}</p>`);
    setContent(elements.descriptor, `<p>${description}</p>`);
    setContent(elements.currentTemp, `<p>${current.temp.toFixed(0)}&deg;C</p>`);
    if (todayRange) {
      setContent(elements.minTemp, `<p>Min: ${todayRange.min}&deg;C</p>`);
      setContent(elements.maxTemp, `<p>Max: ${todayRange.max}&deg;C</p>`);
    }
    setContent(elements.feelsLike, `<p>Feels Like:</br>${current.feels_like.toFixed(0)}&deg;C</p>`);
    setContent(elements.currentHumid, `<p>Humidity:</br>${current.humidity}%</p>`);
    const windKph = (current.wind_speed || 0) * 3.6;
    setContent(elements.windSpd, `<p>Wind Speed:</br>${windKph.toFixed(0)} km/h</p>`);
    const cloudiness = describeCloudiness(current.clouds);
    setContent(elements.cloudiness, `<p>Cloudiness:</br>${cloudiness.label} (${cloudiness.value}%)</p>`);

    const sunriseTime = new Date(current.sunrise * 1000).toLocaleTimeString();
    const sunsetTime = new Date(current.sunset * 1000).toLocaleTimeString();
    setContent(elements.risenset, `<p>Sunrise:</br>${sunriseTime}</p><p>Sunset:</br>${sunsetTime}</p>`);

    const pressure = describePressure(current.pressure);
    setContent(elements.pressure, `<p>Pressure:</br>${pressure.label} (${pressure.value} hPa)</p>`);
    setContent(elements.uvi, `<p>UV:</br>${Math.round(current.uvi || 0)}</p>`);
    const visibility = describeVisibility(current.visibility);
    setContent(elements.visibility, `<p>Visibility:</br>${visibility.label} (${visibility.km} km)</p>`);
  }

  function renderHourly(hourly = []) {
    const container = elements.hourlyForecast;
    if (!container) return;

    container.innerHTML = '';
    hourly.slice(0, 24).forEach((hour) => {
      const weatherIcon = `https://openweathermap.org/img/wn/${hour.weather?.[0]?.icon}.png`;
      const description = formatDescription(hour.weather?.[0]?.description);
      const card = document.createElement('div');
      card.classList.add('hourly-card');
      card.innerHTML = `
        <div class="hourly-time">${formatters.hour(hour.dt)}</div>
        <img class="hourly-icon" src="${weatherIcon}" alt="${description}">
        <div class="hourly-temp">${hour.temp.toFixed(0)}&deg;</div>
      `;
      container.appendChild(card);
    });
  }

  function renderDaily(forecastList = []) {
    const container = elements.dailyForecast;
    if (!container) return;

    container.innerHTML = '';
    if (!forecastList.length) return;

    const looksLikeForecast = forecastList[0] && 'main' in forecastList[0];

    if (looksLikeForecast) {
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
          const weatherIcon = `https://openweathermap.org/img/wn/${weather?.[0]?.icon}.png`;
          const description = formatDescription(weather?.[0]?.description);
          const card = document.createElement('div');
          card.classList.add('forecast-card');
          card.innerHTML = `
            <div class="daily-forecast-child" id="date-time">${formatters.weekday(dt)}</div>
            <img class="daily-forecast-child" src="${weatherIcon}" alt="${description}">
            <div class="daily-forecast-child" id="temperature">${Math.round(main.temp)}&deg;</div>
          `;
          container.appendChild(card);
        });
    } else {
      forecastList.slice(0, 5).forEach((day) => {
        const weatherIcon = `https://openweathermap.org/img/wn/${day.weather?.[0]?.icon}.png`;
        const description = formatDescription(day.weather?.[0]?.description);
        const tempDisplay = day.temp?.day ?? day.temp?.max ?? 0;
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
          <div class="daily-forecast-child" id="date-time">${formatters.weekday(day.dt)}</div>
          <img class="daily-forecast-child" src="${weatherIcon}" alt="${description}">
          <div class="daily-forecast-child" id="temperature">${Math.round(tempDisplay)}&deg;</div>
        `;
        container.appendChild(card);
      });
    }
  }

  return { renderCurrent, renderHourly, renderDaily };
}

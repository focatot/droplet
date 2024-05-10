// mapbox-script.js

// MAPBOX KEY hide!
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';

// OPENWM KEY hide!
openwmAccessToken = '4c2ea446b8fba1b6f13c58bda72e19b2';

// Initialize MAP
const map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/mapbox/streets-v12",
    center: [139.7263785, 35.6652064], // starting position [lng, lat] NEEDS INTEGRATION TO USER LCATION
    zoom: 10,
    // attributionControl: false,
});
map.on('load', function () {
    map.resize();
});

// Initialize GEOCODER
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    language: 'en',
    marker: false,
    types: 'place', // Restrict search 
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// Listens for written locations on GEOCODER
geocoder.on('result', function (e) {
    const [lng, lat] = e.result.geometry.coordinates;
    fetchLocationAndWeather(lng, lat);
    geocoder.setInput('');

});

// Listens for clicked locations in MAP
map.on('click', function (e) {
    const { lng, lat } = e.lngLat;
    fetchLocationAndWeather(lng, lat);
});

// Function to fetch weather data and render forecast
async function fetchAndRenderForecast(longitude, latitude, cityName, weatherData) {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch weather and forecast data simultaneously
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`),
                fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`)
            ]);

            if (!weatherResponse.ok || !forecastResponse.ok) {
                throw new Error('Failed to fetch weather or forecast data.');
            }

            const [weatherData, forecastData] = await Promise.all([
                weatherResponse.json(),
                forecastResponse.json()
            ]);

            // Render current forecast
            updateWeatherInfo(weatherData, cityName);

            // Render daily forecast
            renderDailyForecast(forecastData.list);

            // Render hourly forecast
            renderHourlyForecast(weatherData.hourly);

            resolve(weatherData);
        } catch (error) {
            console.error('Error:', error);
            reject(error);
        }
    });
}

// DATA EXTRACTION: location (format) 
function extractLocationInfo(data) {
    const context = data.features[0].context;
    const city = context.find(item => item.id.includes('place'))?.text || data.features[0].place_name;
    const country = context[context.length - 1].text || ''; // Handle the case where country is not available
    return { city, country };
}
// DATA EXTRACTION: hourly forecast and render
function renderHourlyForecast(hourlyData) {
    const hourlyContainer = document.querySelector('#hourly-forecast');
    hourlyContainer.innerHTML = '';

    hourlyData.slice(0, 25).forEach(hour => {
        const { dt, temp, weather } = hour;
        const formattedTime = new Date(dt * 1000).toLocaleTimeString([], { hour: 'numeric' });
        const weatherIcon = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

        const hourlyCard = document.createElement('div');
        hourlyCard.classList.add('hourly-card');
        hourlyCard.innerHTML = `
            <div class="hourly-time">${formattedTime}</div>
            <img class="hourly-icon" src="${weatherIcon}" alt="${weather[0].description}">
            <div class="hourly-temp">${temp.toFixed(0)}&deg;</div>
        `;
        hourlyContainer.appendChild(hourlyCard);
    });
}

// DATA EXTRACTION: daily forecast and render
function dayForecastFormat(forecastData) {
    return forecastData.reduce((groupedForecast, forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        groupedForecast[date] = (groupedForecast[date] || []).concat(forecast);
        return groupedForecast;
    }, {});
}
function renderDailyForecast(forecastData) {
    const forecastContainer = document.querySelector('#daily-forecast');
    forecastContainer.innerHTML = '';

    Object.entries(dayForecastFormat(forecastData)).forEach(([date, dayForecasts]) => {
        const { dt, main, weather } = dayForecasts[0];
        const formattedDate = new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const temperature = main.temp.toFixed(0);
        const weatherIcon = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

        forecastContainer.innerHTML += `
            <div class="forecast-card">
                <div class="daily-forecast-child" id="date-time">${formattedDate}</div>
                <img class="daily-forecast-child" src="${weatherIcon}" alt="${weather[0].description}">
                <div class="daily-forecast-child" id="temperature">${temperature}&deg;</div>
            </div>
        `;
    });
}
// DATA EXTRACTION: location name with format integrated into fetchAndRenderForecast
async function fetchLocationAndWeather(longitude, latitude) {
    try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&language=en`);
        if (!response.ok) throw new Error('Failed to fetch location data.');

        const data = await response.json();
        const { city, country } = extractLocationInfo(data);
        const cityName = `${city}, ${country}`.trim(); // Combine city and country, removing extra spaces
        const [lng, lat] = data.features[0].center;

        const weatherData = await fetchAndRenderForecast(lng, lat, cityName); // Adds location name to fetchAndRenderForecast

        if (weatherData) {
            console.log("Weather fetched for", cityName, " - ", lng, lat, weatherData.current.temp, weatherData.current.weather[0].description);
        } else {
            console.error("No valid weather forecast data available.");
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Weather info update after request (drag or search) 
function updateWeatherInfo(weatherData, cityName, fetchLocationAndWeather) {
    const cityNameElement = document.getElementById('cityName');
    const descriptionElement = document.getElementById('descriptor');
    const tempElement = document.getElementById('currentTemp');
    const feelsElement = document.getElementById('feelsLike');
    const humidElement = document.getElementById('currentHumid');
    const windElement = document.getElementById('windSpd');
    const cloudElement = document.getElementById('cloudiness');
    const risesetElement = document.getElementById('risenset');
    const pressureElement = document.getElementById('pressure');
    const uviElement = document.getElementById('uvi');
    const visibilityElement = document.getElementById('visibility');

    cityNameElement.innerHTML = `<p>${cityName}</p>`;
    descriptionElement.innerHTML = `<p>${weatherData.current.weather[0].description}</p>`;
    tempElement.innerHTML = `<p>${weatherData.current.temp.toFixed(0)}&deg;</p>`;
    feelsElement.innerHTML = `<p>Feels Like:</br>${weatherData.current.feels_like.toFixed(0)}&deg;C</p>`;
    humidElement.innerHTML = `<p>Humidity:</br>${weatherData.current.humidity}%</p>`;
    windElement.innerHTML = `<p>Wind Speed:</br>${weatherData.current.wind_speed.toFixed(0)} m/s</p>`;
    cloudElement.innerHTML = `<p>Cloudiness:</br>${weatherData.current.clouds}%</p>`;
    const sunriseTime = new Date(weatherData.current.sunrise * 1000).toLocaleTimeString();
    const sunsetTime = new Date(weatherData.current.sunset * 1000).toLocaleTimeString();
    risesetElement.innerHTML = `<p>Sunrise:</br>${sunriseTime}</p></br><p>Sunset:</br>${sunsetTime}</p>`;
    pressureElement.innerHTML = `<p>Pressure:</br>${weatherData.current.pressure}</p>`;
    uviElement.innerHTML = `<p>UV:</br>${weatherData.current.uvi}</p>`;
    visibilityElement.innerHTML = `<p>Visibility:</br>${weatherData.current.visibility}</p>`;
}

// Function to obtain user's location and update map center
async function getUserLocationAndUpdateMap(map) {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const longitude = position.coords.longitude;
                    const latitude = position.coords.latitude;
                    map.setCenter([longitude, latitude]); // Update map center
                    resolve({ longitude, latitude });
                },
                error => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

// Run
async function renderWeather() {
    try {
        // Attempt to get user's location and update map center
        const { longitude, latitude } = await getUserLocationAndUpdateMap(map);

        // Fetch location data using user's location
        const locationData = await fetchLocationAndWeather(longitude, latitude);

        if (locationData && locationData.cityName) {
            const cityName = locationData.cityName;
            const weatherData = await fetchAndRenderForecast(longitude, latitude, cityName);
            if (!weatherData) {
                console.error("No valid weather forecast data available.");
            }
        }
        else {
            console.error("Failed to fetch city name.");
        }
    } catch (error) {
        console.error("Error fetching or rendering weather forecast:", error);
        // Handle error
    }
}
renderWeather();

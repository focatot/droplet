// mapbox-script.js

// MAPBOX KEY hide!
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';

// OPENWM KEY hide!
openwmAccessToken = '4c2ea446b8fba1b6f13c58bda72e19b2';

// Initialize MAP
const map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/mapbox/streets-v12",
    center: [139.7263785, 35.6652065], // starting position [lng, lat] NEEDS INTEGRATION TO USER LCATION
    zoom: 10,
    // attributionControl: false,
});
map.on('load', function () {
    map.resize();
});
// // Listen for moveend event on the map
// map.on('moveend', function () {
//     renderWeatherWidget();
// });


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
function fetchLocationAndWeather(longitude, latitude) {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&language=en`)
        .then(response => response.json())
        .then(data => {
            const cityName = findCityCountry(data);
            const [lng, lat] = data.features[0].center; // Use the first result's coordinates
            fetchWeatherAndRenderForecast(lng, lat, cityName)
                .then(weatherData => {
                    // Now you have access to weatherData here
                    console.log("Weather fetched for", cityName, " - ", lng, lat, weatherData.main.temp, weatherData.weather[0].description);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function findCityCountry(data) {
    let cityName = "";
    // Iterate through the features array
    for (const feature of data.features) {
        // Access the city and country parts directly from the context array
        const cityContext = feature.context.find(item => item.id.includes('place'));
        const countryContext = feature.context.find(item => item.id.includes('country'));
        if (cityContext && countryContext) {
            cityName = `${cityContext.text}, ${countryContext.text}`; // Concatenate city and country
            break; // Break out of the loop once the desired format is found
        }
    }
    return cityName;
}

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
async function fetchWeatherAndRenderForecast(longitude, latitude, cityName) {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`);
        const weatherData = await weatherResponse.json();

        // Update weather info
        updateWeatherInfo(weatherData, cityName);

        // Fetch forecast data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`);
        const forecastData = await forecastResponse.json();

        // Render forecast cards
        renderForecastCards(forecastData.list);

        // Return weatherData for further use
        return weatherData;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function updateForecastCards(cards, forecastData) {
    console.log("Updating forecast cards with new data:", forecastData);
    if (!forecastData || forecastData.length === 0) {
        console.error("No forecast data available.");
        return;
    }

    cards.forEach((card, index) => {
        const forecast = forecastData[index];
        console.log("Forecast for card", index + 1, ":", forecast);
        if (forecast) {
            const dateTime = new Date(forecast.dt * 1000);
            const formattedDate = dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const temperature = forecast.main.temp;
            const weatherDescription = forecast.weather[0].description;
            const weatherIcon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

            card.innerHTML = `
                <img src="${weatherIcon}" alt="${weatherDescription}">
                <div class="date-time">${formattedDate}</div>
                <div class="temperature">${temperature.toFixed(0)}&deg</div>
            `;
        } else {
            console.error("No forecast data available for card", index + 1);
        }
    });
}

function renderWeatherForecast(forecastData) {
    const forecastContainer = document.querySelector('#forecast');
    forecastData.forEach(forecast => {
        const dateTime = new Date(forecast.dt * 1000);
        const formattedDate = dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const temperature = forecast.main.temp;
        const weatherDescription = forecast.weather[0].description;
        const weatherIcon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <img src="${weatherIcon}" alt="${weatherDescription}">
            <div class="date-time">${formattedDate}</div>
            <div class="temperature">${temperature.toFixed(0)}&deg</div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}
//////////////////////
// Extracts city and country name from DATA 
function extractCity(data) {
    const context = data.features[0].context; // Extract city name from the response
    if (context && context.length > 0) {
        const cityContext = context.find(item => item.id.includes('place')); // Find the context item that contains the city name
        if (cityContext) { // If a matching context item is found, return its text
            return cityContext.text;
        }
    }
    return data.features[0].place_name; // Return alternative, longer place name if the city name cannot be extracted
}
function extractCountry(data) { // Extract country name from the response
    const context = data.features[0].context;
    return context[context.length - 1].text; // Assumes the country name is the last element in the context array
}

// Updates values in UI for spotlight and widget data (not forecast)
function updateWeatherInfo(weatherData, cityName) {
    const cityNameElement = document.getElementById('cityName');
    const descriptionElement = document.getElementById('descriptor');
    const tempElement = document.getElementById('currentTemp');
    const feelsElement = document.getElementById('feelsLike');
    const humidElement = document.getElementById('currentHumid');
    const minElement = document.getElementById('minTemp');
    const maxElement = document.getElementById('maxTemp');
    const windElement = document.getElementById('windSpd');
    const cloudElement = document.getElementById('cloudiness');
    const risesetElement = document.getElementById('risenset');

    cityNameElement.innerHTML = `<p>${cityName}</p>`;
    descriptionElement.innerHTML = `<p>${weatherData.weather[0].description}</p>`;
    tempElement.innerHTML = `<p>${weatherData.main.temp.toFixed(0)}&deg;</p>`;
    feelsElement.innerHTML = `<p>Feels Like:</br>${weatherData.main.feels_like.toFixed(0)}&deg;C</p>`;
    humidElement.innerHTML = `<p>Humidity:</br>${weatherData.main.humidity}%</p>`;
    minElement.innerHTML = `<p>L: ${weatherData.main.temp_min.toFixed(0)}&deg;</p>`;
    maxElement.innerHTML = `<p>H: ${weatherData.main.temp_max.toFixed(0)}&deg;</p>`;
    windElement.innerHTML = `<p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>`;
    cloudElement.innerHTML = `<p>Cloudiness:</br>${weatherData.clouds.all}%</p>`;
    risesetElement.innerHTML = `<p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p></br> <p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>`;
}
////////////////////////////////////////


// Renders forecast widget
async function fetchWeatherForecast(longitude, latitude) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather forecast');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather forecast:', error.message);
        return null;
    }
}
function renderForecastCards(forecastData) { // Function to render forecast cards
    const forecastContainer = document.querySelector('#forecast');
    forecastContainer.innerHTML = ''; // Clear previous forecast cards
    const groupedForecast = groupForecastByDate(forecastData);

    for (const date in groupedForecast) {
        if (groupedForecast.hasOwnProperty(date)) {
            const dayForecasts = groupedForecast[date];
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');

            // Use the first forecast of the day to display general information
            const firstForecast = dayForecasts[0];
            const dateTime = new Date(firstForecast.dt * 1000);
            const formattedDate = dateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const temperature = firstForecast.main.temp;
            const weatherDescription = firstForecast.weather[0].description;
            const weatherIcon = `http://openweathermap.org/img/wn/${firstForecast.weather[0].icon}.png`;

            forecastCard.innerHTML = `
                <img src="${weatherIcon}" alt="${weatherDescription}">
                <div class="date-time">${formattedDate}</div>
                <div class="temperature">${temperature.toFixed(0)}&deg</div>
            `;
            forecastContainer.appendChild(forecastCard);
        }
    }
}
function groupForecastByDate(forecastData) { // Function to group forecast data by date
    const groupedForecast = {};
    forecastData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (!groupedForecast[date]) {
            groupedForecast[date] = [];
        }
        groupedForecast[date].push(day);
    });
    return groupedForecast;
}
async function renderWeatherWidget() {
    const center = map.getCenter();
    const longitude = center.lng;
    const latitude = center.lat;

    try {
        const weatherData = await fetchWeatherForecast(longitude, latitude);
        if (weatherData && weatherData.list && weatherData.list.length > 0) {
            renderForecastCards(weatherData.list);
        } else {
            console.error("No valid weather forecast data available.");
        }
    } catch (error) {
        console.error("Error fetching or rendering weather forecast:", error);
    }
}

renderWeatherWidget();

//////////////////////////////////

// OpenWeatherMap initial request 
// Spotlight, widgets
fetch(`https://api.openweathermap.org/data/2.5/weather?q=tokyo&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`)
    .then(response => response.json())
    .then(weatherData => {
        const city = "Tokyo, Japan"; // Set the city manually since it's not extracted from geocoder in this fetch, this is NOT linked, shits just a placeholder wtf
        updateWeatherInfo(weatherData, city);
    })
    .catch(error => console.log('error', error));


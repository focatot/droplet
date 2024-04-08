// mapbox-script.js

// MAPBOX KEY hide!
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';

// OPENWM KEY hide!
openwmAccessToken = '4c2ea446b8fba1b6f13c58bda72e19b2';


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const map = new mapboxgl.Map({ // Init map 
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/light-v11", // dark mode :pp 
    center: [139.7263785, 35.6652065], // starting position [lng, lat] NEEDS INTEGRATION TO USER LCATION
    zoom: 10, // raise to zoom in 
    // attributionControl: false,
});

map.on('load', function () {
    map.resize(); // Dinamically rezises and centers map
});

var geocoder = new MapboxGeocoder({ // Init geocoder 
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    types: 'place', // Restrict search 
});

// Append the geocoder control to the HTML element with the id 'geocoder'
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// map.addControl(geocoder); // Init search box control 

geocoder.on('result', function (e) { // Listen for the 'result' event and init weather request

    const selectedPlaceName = e.result.place_name; // Extract the selected place name from the event object

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedPlaceName}.json?access_token=${mapboxgl.accessToken}`)  // Fetch data from the Mapbox API using the selected place name
        .then(response => response.json())
        .then(data => {
            console.log("fetching location..."); // Extract the city name from the API response
            var [longitude, latitude] = data.features[0].center; // Extract the coordinates from the API response
            console.log("location fetched for", selectedPlaceName);
            console.log(longitude, latitude);
            console.log("fetching weather...");
            return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`) // Fetch data from the OpenWM API using the selected coordinates
                .then(response => response.json())
                .then(weatherData => {
                    console.log("weather fetched for", selectedPlaceName);
                    console.log(weatherData.main.temp, weatherData.weather[0].description);
                    updateWeatherInfo(weatherData, selectedPlaceName);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
});

map.on('click', function (e) { // Add a click event listener to the map

    const clickedCoordinates = e.lngLat; // Extract the clicked coordinates
    const longitude = clickedCoordinates.lng; // Store lng
    const latitude = clickedCoordinates.lat; // Store lat

    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`) // Reverse geocode the clicked coordinates to retrieve the city name
        .then(response => response.json())
        .then(data => {
            const city = extractCity(data);
            const country = extractCountry(data);
            const cityName = `${city}, ${country}`;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`) // Fetch weather data for the clicked coordinates
                .then(response => response.json())
                .then(weatherData => {
                    console.log("weather fetched from globe click for", cityName);
                    console.log(longitude, latitude);
                    console.log(weatherData.main.temp, weatherData.weather[0].description);
                    updateWeatherInfo(weatherData, cityName); // Update the UI with weather data for the clicked location
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

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

fetch(`https://api.openweathermap.org/data/2.5/weather?q=tokyo&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`) // Init weather request 
    .then(response => response.json())
    .then(weatherData => {
        const city = "Tokyo, Japan"; // Set the city manually since it's not extracted from geocoder in this fetch
        updateWeatherInfo(weatherData, city);
    })
    .catch(error => console.log('error', error));

function updateWeatherInfo(weatherData, cityName) { // Update dashboard with retrieved values and assign values to HTML elements
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

////////////////////////////////////////////////////////////////////////////

// Function to fetch weather forecast data
async function fetchWeatherForecast(geocoder) {
    try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/forecast?lat=40.419508&lon=-3.704281&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric'); // placeholder location PLEASE CHANGE FOR LONG AND LAT VARIABLES
        if (!response.ok) {
            throw new Error('Failed to fetch weather forecast');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather forecast:', error.message);
        // Handle error (e.g., display error message to user)
    }
}

// Function to render weather forecast widget
async function renderWeatherWidget() {
    const weatherData = await fetchWeatherForecast();
    if (weatherData) {
        renderForecastCards(weatherData.list);
    }
}

// Function to group forecast data by date
function groupForecastByDate(forecastData) {
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

// Function to render forecast cards
function renderForecastCards(forecastData) {
    const forecastContainer = document.querySelector('#forecast');
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

// Call the function to render the weather widget
renderWeatherWidget();

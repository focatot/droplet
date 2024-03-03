// mapbox-script.js

// Mapbox key
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';

// OpenWM key
openwmAccessToken = '4c2ea446b8fba1b6f13c58bda72e19b2';

const map = new mapboxgl.Map({ // Init map 
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/dark-v11", // dark mode :pp 
    center: [-66.91548939287081, 10.505832123619967], // starting position [lng, lat] NEEDS INTEGRATION TO USER LCATION
    zoom: 10, // raise to zoom in 
    // attributionControl: false,
});

map.on('load', function() { 
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

geocoder.on('result', function(e) { // Listen for the 'result' event and init weather request

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

map.on('click', function(e) { // Add a click event listener to the map

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

fetch(`https://api.openweathermap.org/data/2.5/weather?q=caracas&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`) // Init weather request 
    .then(response => response.json())
    .then(weatherData => {
        const city = "Caracas, Capital District, Venezuela"; // Set the city manually since it's not extracted from geocoder in this fetch
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
    const visionElement = document.getElementById('visibility');
    const windElement = document.getElementById('windSpd');
    const cloudElement = document.getElementById('cloudiness');
    const riseElement = document.getElementById('sunrise');
    const setElement = document.getElementById('sunset');

    cityNameElement.innerHTML = `<p>${cityName}</p>`;
    descriptionElement.innerHTML = `<p>${weatherData.weather[0].description}</p>`;
    tempElement.innerHTML = `<p>${weatherData.main.temp.toFixed(0)}&deg;</p>`;
    feelsElement.innerHTML = `<p>Feels Like:</br>${weatherData.main.feels_like.toFixed(0)} &deg;C</p>`;
    humidElement.innerHTML = `<p>Humidity:</br>${weatherData.main.humidity}%</p>`;
    minElement.innerHTML = `<p>L: ${weatherData.main.temp_min.toFixed(0)}&deg;</p>`;
    maxElement.innerHTML = `<p>H: ${weatherData.main.temp_max.toFixed(0)}&deg;</p>`;
    visionElement.innerHTML = `<p>Visibility:</br>${(weatherData.visibility / 1000).toFixed(1)} km</p>`;
    windElement.innerHTML = `<p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>`;
    cloudElement.innerHTML = `<p>Cloudiness:</br>${weatherData.clouds.all}%</p>`;
    riseElement.innerHTML = `<p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>`;
    setElement.innerHTML = `<p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>`;
}
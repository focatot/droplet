// mapbox-script.js

// Mapbox key
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';

// OpenWM key
openwmAccessToken = '4c2ea446b8fba1b6f13c58bda72e19b2';

// Init map 
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/dark-v11", // dark mode :pp 
    center: [-66.915660, 10.505404], // starting position [lng, lat] NEEDS INTEGRATION TO USER LCATION
    zoom: 10, // raise to zoom in 
});

// Init geocoder 
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    types: 'place' // Restrict search 
});

// Init search box control 
map.addControl(geocoder);

// Add a click event listener to the map
map.on('click', function(e) {

    const clickedCoordinates = e.lngLat; // Extract the clicked coordinates
    const longitude = clickedCoordinates.lng; // Store lng
    const latitude = clickedCoordinates.lat; // Store lat

    // Reverse geocode the clicked coordinates to retrieve the city name
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
            // Extract the place name from the API response
            const city = data.features[0].place_name;

            // Fetch weather data for the clicked coordinates
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`)
                .then(response => response.json())
                .then(weatherData => {
                    console.log("weather fetched from globe click for", city);
                    console.log(longitude, latitude);
                    console.log(weatherData.main.temp, weatherData.weather[0].description);
                    updateWeatherInfo(weatherData, city); // Update the UI with weather data for the clicked location
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});



// Listen for the 'result' event and init weather request
geocoder.on('result', function(e) {

    // Extract the selected place name from the event object
    const selectedPlaceName = e.result.place_name;
    
    // Fetch data from the Mapbox API using the selected place name
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedPlaceName}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => response.json())
        .then(data => {
            console.log("fetching location..."); // Extract the city name from the API response
            var city = data.features[0].place_name; // Extract the city name from the API response
            var [longitude, latitude] = data.features[0].center; // Extract the coordinates from the API response
            console.log("location fetched for", city);
            console.log(longitude, latitude);
            console.log("fetching weather...");
            // Fetch data from the OpenWM API using the selected coordinates
            return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openwmAccessToken}&units=metric`)
                .then(response => response.json())
                .then(weatherData => {
                    console.log("weather fetched for", city);
                    console.log(weatherData.main.temp, weatherData.weather[0].description);
                    updateWeatherInfo(weatherData, city);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
});

// Init weather request 
fetch(`https://api.openweathermap.org/data/2.5/weather?q=caracas&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`) // Based in default map center coordinates "caracas"
    .then(response => response.json())
    .then(weatherData => {
        const city = "Caracas, Capital District, Venezuela"; // Set the city manually since it's not extracted from geocoder in this fetch
        updateWeatherInfo(weatherData, city);
    })
    .catch(error => console.log('error', error));

// Update dashboard with retrieved values
function updateWeatherInfo(weatherData, city, country) {
    const cityNameElement = document.getElementById('cityName');
    const descriptionElement = document.getElementById('descriptor');
    const tempElement = document.getElementById('currentTemp');
    const feelsElement = document.getElementById('feelsLike');
    const humidElement = document.getElementById('currentHumid');
    const minElement = document.getElementById('minTemp');
    const maxElement = document.getElementById('maxTemp');
    const visionElement = document.getElementById('visibility');
    const windElement = document.getElementById('windSpd');
    const windDirElement = document.getElementById('windDirection');
    const cloudElement = document.getElementById('cloudiness');
    const riseElement = document.getElementById('sunrise');
    const setElement = document.getElementById('sunset');

    // Assign values to HTML elements
    cityNameElement.innerHTML = `<p>${city}</p>`;
    descriptionElement.innerHTML = `<p>${weatherData.weather[0].description}</p>`;
    tempElement.innerHTML = `<p>${weatherData.main.temp.toFixed(0)}&deg;</p>`;
    feelsElement.innerHTML = `<p>Feels Like:</br>${weatherData.main.feels_like.toFixed(0)} &deg;C</p>`;
    humidElement.innerHTML = `<p>Humidity:</br>${weatherData.main.humidity}%</p>`;
    minElement.innerHTML = `<p>L: ${weatherData.main.temp_min.toFixed(0)}&deg;</p>`;
    maxElement.innerHTML = `<p>H: ${weatherData.main.temp_max.toFixed(0)}&deg;</p>`;
    visionElement.innerHTML = `<p>Visibility:</br>${(weatherData.visibility / 1000).toFixed(1)} km</p>`;
    windElement.innerHTML = `<p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>`;
    windDirElement.innerHTML = `<p>Wind Direction:</br>${weatherData.wind.deg} &deg;</p>`;
    cloudElement.innerHTML = `<p>Cloudiness:</br>${weatherData.clouds.all}%</p>`;
    riseElement.innerHTML = `<p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>`;
    setElement.innerHTML = `<p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>`;
}
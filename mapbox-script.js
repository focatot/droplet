// mapbox-script.js


/////////// MAPBOX() /////////

// Access variables
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';
mapboxStyle = "mapbox://styles/mapbox/dark-v11";

// Init map
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: mapboxStyle, // dark mode :pp 
    center: [-66.915660, 10.505404], // starting position [lng, lat] NEEDS INTEGRATION TO USER LCATION
    zoom: 10, // raise to zoom in 
});

// Init geocoder
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    types: 'place' // Restrict search results to only include places (cities)
});

// Init search box control
map.addControl(geocoder);

// Predefined init request
// SHOULD WORK IN SYNC WITH GETWEATHERBYCITY ALSO CHECK CENTER IN MAP INIT 
var cityBox = ("Caracas"); 

// Listen for the 'result' event
geocoder.on('result', function(e) {

// Extract the selected place name from the event object
const selectedPlaceName = e.result.text;
  
// Fetch data from the Mapbox API using the selected place name
fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedPlaceName}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
    // Extract the city name from the API response
    const cityBox = data.features[0].place_name;
    console.log("MAPBOX says: fetching location for", cityBox)
    getWeatherByCity(selectedPlaceName);
    console.log('MAPBOX says: location fetched');
    })

    .catch(error => {
    console.error('Error fetching data from Mapbox API:', error);
    });
});

/////////// MAPBOX(/) /////////

/////////// OPENWEATHERMAP() /////////
  
// setting up API key, constructing API URL, and fetching weather data
function getWeatherByCity(cityBox) {
    console.log('OPENWEATHERMAPS says: fetching weather for', cityBox);
    const apiKey = '4c2ea446b8fba1b6f13c58bda72e19b2';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityBox}&appid=${apiKey}&units=metric`;
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(updateWeatherInfo)
      .then(response => console.log("OPENWEATHERMAPS says: weather fetched"))
      .catch(error => console.log('error', error));
      
}

// This function returns an object containing references to various weather-related DOM elements.
function getWeatherElements() {
    return {
        city: document.getElementById('cityName'),
        description: document.getElementById('descriptor'),
        temp: document.getElementById('currentTemp'),
        feels: document.getElementById('feelsLike'),
        humid: document.getElementById('currentHumid'),
        min: document.getElementById('minTemp'),
        max: document.getElementById('maxTemp'),
        vision: document.getElementById('visibility'),
        wind: document.getElementById('windSpd'),
        windDir: document.getElementById('windDirection'),
        cloud: document.getElementById('cloudiness'),
        rise: document.getElementById('sunrise'),
        set: document.getElementById('sunset'),
    };
}

// This function updates the HTML content of weather-related elements based on the received weather data.
function updateWeatherInfo(weatherData) {
    const weatherElements = getWeatherElements();
        weatherElements.city.innerHTML = `<p>${weatherData.name}, ${weatherData.sys.country}<p>`;
        weatherElements.description.innerHTML = `<p>${weatherData.weather[0].description}</p>`;
        weatherElements.temp.innerHTML = `<p>${weatherData.main.temp.toFixed(0)}&deg;</p>`;
        weatherElements.feels.innerHTML = `<p>Feels Like:</br>${weatherData.main.feels_like.toFixed(0)} &deg;C</p>`;
        weatherElements.humid.innerHTML = `<p>Humidity:</br>${weatherData.main.humidity}%</p>`;
        weatherElements.min.innerHTML = `<p>L: ${weatherData.main.temp_min.toFixed(0)}&deg;</p>`;
        weatherElements.max.innerHTML = `<p>H: ${weatherData.main.temp_max.toFixed(0)}&deg;</p>`;
        weatherElements.vision.innerHTML = `<p>Visibility:</br>${weatherData.visibility / 1000} km</p>`;
        weatherElements.wind.innerHTML = `<p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>`;
        weatherElements.windDir.innerHTML = `<p>Wind Direction:</br>${weatherData.wind.deg} &deg;</p>`;
        weatherElements.cloud.innerHTML = `<p>Cloudiness:</br>${weatherData.clouds.all}%</p>`;
        weatherElements.rise.innerHTML = `<p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>`;
        weatherElements.set.innerHTML = `<p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>`;
}

// Init weather request 
// SHOULD WORK IN SYNC WITH GETWEATHERBYCITY ALSO CHECK CENTER IN MAP INIT 
getWeatherByCity(cityBox);

/////////// OPENWEATHERMAP(/) /////////
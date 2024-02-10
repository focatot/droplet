// mapbox-script.js


/////////// MAPBOX() /////////

// Mapbox key
mapboxgl.accessToken = 'pk.eyJ1IjoiZmNheWF5byIsImEiOiJjbHJ5MmR3bjgxZWp4MmpwYndpejRzc2pqIn0.WnTM1dHJuY92ek7FPXHE_w';


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


// Listen for the 'result' event
geocoder.on('result', function(e) {

// Extract the selected place name from the event object
const selectedPlaceName = e.result.text;
  
// Fetch data from the Mapbox API using the selected place name
fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedPlaceName}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => response.json())
    .then(data => {
        console.log("fetching location..."); // Extract the city name from the API response
        var cityBox = data.features[0].place_name; // Extract the city name from the API response
        var [longitude, latitude] = data.features[0].center; // Extract the coordinates from the API response
        console.log("location fetched for", cityBox);
        console.log(longitude, latitude);
        getWeatherByCity(selectedPlaceName, latitude, longitude); // Call getWeatherByCity with latitude and longitude values
    })

    .catch(error => {
        console.error('Error fetching data from Mapbox API:', error);
    });
});

/////////// MAPBOX(/) /////////

/////////// OPENWEATHERMAP() /////////
  
// setting up API key, constructing API URL, and fetching weather data
function getWeatherByCity(cityBox, latitude, longitude) {
    const apiKey = '4c2ea446b8fba1b6f13c58bda72e19b2';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    console.log('fetching weather for', cityBox);
    fetch(apiUrl)
      .then(response => response.json())
      .then(updateWeatherInfo)
      .then(response => console.log("weather fetched"))
      .catch(error => console.log('error', error));
}

// Update weather information on the webpage
function updateWeatherInfo(weatherData) {
    const city = document.getElementById('cityName');
    const description = document.getElementById('descriptor');
    const temp = document.getElementById('currentTemp');
    const feels = document.getElementById('feelsLike');
    const humid = document.getElementById('currentHumid');
    const min = document.getElementById('minTemp');
    const max = document.getElementById('maxTemp');
    const vision = document.getElementById('visibility');
    const wind = document.getElementById('windSpd');
    const windDir = document.getElementById('windDirection');
    const cloud = document.getElementById('cloudiness');
    const rise = document.getElementById('sunrise');
    const set = document.getElementById('sunset');
    
    
    // Assign JSON values from api call to html elements
    city.innerHTML = `<p>${weatherData.name}, ${weatherData.sys.country}<p>`;
    description.innerHTML = `<p>${weatherData.weather[0].description}</p>`;
    temp.innerHTML = `<p>${weatherData.main.temp.toFixed(0)}&deg;</p>`;
    feels.innerHTML = `<p>Feels Like:</br>${weatherData.main.feels_like.toFixed(0)} &deg;C</p>`;
    humid.innerHTML = `<p>Humidity:</br>${weatherData.main.humidity}%</p>`;
    min.innerHTML = `<p>L: ${weatherData.main.temp_min.toFixed(0)}&deg;</p>`;
    max.innerHTML = `<p>H: ${weatherData.main.temp_max.toFixed(0)}&deg;</p>`;
    vision.innerHTML = `<p>Visibility:</br>${(weatherData.visibility / 1000).toFixed(1)} km</p>`;
    wind.innerHTML = `<p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>`;
    windDir.innerHTML = `<p>Wind Direction:</br>${weatherData.wind.deg} &deg;</p>`;
    cloud.innerHTML = `<p>Cloudiness:</br>${weatherData.clouds.all}%</p>`;
    rise.innerHTML = `<p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>`;
    set.innerHTML = `<p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>`;
}

// Init weather request 
fetch(`https://api.openweathermap.org/data/2.5/weather?q=caracas&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`) // Based in default map center coordinates "caracas"
.then(response => response.json())
.then(updateWeatherInfo)
.catch(error => console.log('error', error));

/////////// OPENWEATHERMAP(/) /////////
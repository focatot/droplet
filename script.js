// Get DOM elements
const inputField = document.getElementById('locationInput');
const weatherElements = {
  city: document.getElementById('cityName'),
  temp: document.getElementById('currentTemp'),
  feels: document.getElementById('feelsLike'),
  humid: document.getElementById('currentHumid'),
  min: document.getElementById('minTemp'),
  max: document.getElementById('maxTemp'),
  press: document.getElementById('pressure'),
  vision: document.getElementById('visibility'),
  wind: document.getElementById('windSpd'),
  windDir: document.getElementById('windDirection'),
  cloud: document.getElementById('cloudiness'),
  rise: document.getElementById('sunrise'),
  set: document.getElementById('sunset'),
};

// Create Autocomplete object
const autocomplete = new google.maps.places.Autocomplete(inputField, {
  types: ['(cities)'] // Restrict to cities
});

// Event listeners
autocomplete.addListener('place_changed', handlePlaceChanged);
inputField.addEventListener('keydown', handleEnterKey);

// Functions
function handlePlaceChanged() {
  const place = autocomplete.getPlace();
  if (place.geometry && place.geometry.location) {
    handleWeatherRequest(place.name);
  }
}

function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleWeatherRequest(inputField.value);
  }
}

function getWeather() {
  handleWeatherRequest(inputField.value);
}

function handleWeatherRequest(cityName) {
  if (cityName.trim() !== "") {
    getWeatherByCity(cityName);
  } else {
    alert("Please enter a valid city name.");
  }
}

function getWeatherByCity(cityName) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`)
    .then(response => response.json())
    .then(updateWeatherInfo)
    .catch(error => console.log('error', error));
}

function updateWeatherInfo(weatherData) {
  inputField.value = "";
  // Update the HTML content based on weather data
  weatherElements.city.innerHTML = `<h1>${weatherData.name}, ${weatherData.sys.country}</h1>`;
  weatherElements.temp.innerHTML = `<p>Temperature:</br>${weatherData.main.temp} &deg;C<p>`;
  weatherElements.feels.innerHTML = `<p>Feels Like:</br>${weatherData.main.feels_like} &deg;C</p>`;
  weatherElements.humid.innerHTML = `<p>Humidity:</br>${weatherData.main.humidity}%</p>`;
  weatherElements.min.innerHTML = `<p>Min Temperature:</br>${weatherData.main.temp_min} &deg;C</p>`;
  weatherElements.max.innerHTML = `<p>Max Temperature:</br>${weatherData.main.temp_max} &deg;C</p>`;
  weatherElements.press.innerHTML = `<p>Pressure:</br>${weatherData.main.pressure} hPa</p>`;
  weatherElements.vision.innerHTML = `<p>Visibility:</br>${weatherData.visibility / 1000} km</p>`;
  weatherElements.wind.innerHTML = `<p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>`;
  weatherElements.windDir.innerHTML = `<p>Wind Direction:</br>${weatherData.wind.deg} &deg;</p>`;
  weatherElements.cloud.innerHTML = `<p>Cloudiness:</br>${weatherData.clouds.all}%</p>`;
  weatherElements.rise.innerHTML = `<p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>`;
  weatherElements.set.innerHTML = `<p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>`;
}

// Initial weather request
getWeatherByCity("Caracas");

  
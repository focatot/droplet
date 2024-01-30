// GLOBAL VARIABLES
const inputField = document.getElementById('locationInput');

// GOOGLE API
// INITIALIZING GOOGLE MAPS AND AUTOCOMPLETE

  // This callback function is executed when the Google Maps API is loaded.
  function initMap() {

    // Create Autocomplete object
    const autocomplete = new google.maps.places.Autocomplete(inputField, {
    types: ['(cities)']
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
  }
  // Places API script loading
  function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBYbEUl_sMd6gtJKnH-JUPEvRIeU-ckKS0&libraries=places&callback=initMap`;
    script.defer = true;
    script.async = true;
    script.onload = initMap;
    script.onerror = function () {
      console.error('Error loading Google Maps API script.');
    };
    // Append the script element to the document's head
    document.head.appendChild(script); 
  }

  // Running Places API
  loadGoogleMapsScript();

//---------------------


// HANDLING WEATHER REQUEST
  // This function handles the weather request based on the provided city name.
  function handleWeatherRequest(cityName) {
    if (cityName.trim() !== "") {
    inputField.value = "";
    getWeatherByCity(cityName, inputField);
    } 
    else {
      alert("Please enter a valid city name.");
    }
  }

// HANDLING ENTER KEY PRESS
// This function handles the keydown event for the Enter key and triggers the weather request.
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleWeatherRequest(inputField.value);
  }
}

// FETCHING WEATHER DATA BY CITY USING OPENWEATHERMAP API
// This function fetches weather data from the OpenWeatherMap API based on the provided city name.
function getWeatherByCity(cityName) {

  const apiKey = '4c2ea446b8fba1b6f13c58bda72e19b2';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(updateWeatherInfo)
    .catch(error => console.log('error', error));
  


}


// FUNCTION TO INITIATE A WEATHER REQUEST
// This function initiates a weather request based on the current value of the input field.
function getWeather() {
  handleWeatherRequest(inputField.value);
}

// GET DOM ELEMENTS
// This function retrieves the input field element by its ID
function getInputField() {
  return document.getElementById('locationInput');
  
}

// GETTING WEATHER ELEMENTS
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

// UPDATING WEATHER DATA IN HTML
// This function updates the HTML content of weather-related elements based on the received weather data.
function updateWeatherInfo(weatherData) {
  inputField.value = "";
  const weatherElements = getWeatherElements();
  weatherElements.city.innerHTML = `<h1>${weatherData.name}</h1>`;
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

// INITIAL WEATHER REQUEST
// Initiating a weather request for the initial city ("Caracas")
getWeatherByCity("Caracas");
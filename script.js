var inputField = document.getElementById('locationInput');
var datalist = document.getElementById('citiesList');



// Event listener for input changes (Geonames API autocomplete)
inputField.addEventListener('input', function() {
var userInput = inputField.value;
  if (userInput.trim() !== "") {
        // Use Geonames API for autocomplete
        fetch(`http://api.geonames.org/searchJSON?p=${userInput}&maxRows=5&orderby=population&username=garua`)
        .then(response => response.json())
        .then(data => {

        // Clear existing options
        datalist.innerHTML = "";

        // Extract city names from the Geonames response
        var suggestions = data.geonames.map(city => city.name);

        // Display suggestions (you might use a dropdown or other UI element)
        suggestions.forEach(city => {
          var option = document.createElement('option');
          option.value = city;
          datalist.appendChild(option);
        });
      })
      .catch(error => console.error('Error fetching Geonames data:', error));
  }
});
// --------------------------------------------------------

    inputField.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});    

function getWeather() {
    var inputField = document.getElementById('locationInput');
    var cityName = inputField.value;

    if (cityName.trim() !== "") {
      getWeatherByCity(cityName);
    } else {
      alert("Please enter a valid city name.");
    }
  }

function getWeatherByCity(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=4c2ea446b8fba1b6f13c58bda72e19b2&units=metric`)
      .then(response => response.json())
      .then(weatherData => {
        updateWeatherInfo(weatherData);
      })

      .catch(error => console.log('error', error));
  }
  
  function updateWeatherInfo(weatherData) {
    // Update the HTML content based on weather data
    
    var city = document.getElementById('cityName');
    city.innerHTML = `
        <h1>${weatherData.name}, ${weatherData.sys.country}</h1>
        <h3>${weatherData.weather[0].description}</h3>
    `;

    var temp = document.getElementById('currentTemp');
    temp.innerHTML = `
        <p>Temperature:</br>${weatherData.main.temp} &deg;C<p>
    `;

    var feels = document.getElementById('feelsLike');
    feels.innerHTML = `
        <p>Feels Like:</br>${weatherData.main.feels_like} &deg;C</p>
    `;

    var humid = document.getElementById('currentHumid');
    humid.innerHTML = `
        <p>Humidity:</br>${weatherData.main.humidity}%</p>
    `;

    var min = document.getElementById('minTemp');
    min.innerHTML = `
        <p>Min Temperature:</br>${weatherData.main.temp_min} &deg;C</p>
    `;

    var max = document.getElementById('maxTemp');
    max.innerHTML = `
        <p>Max Temperature:</br>${weatherData.main.temp_max} &deg;C</p>
    `;

    var press = document.getElementById('pressure');
    press.innerHTML = `
        <p>Pressure:</br>${weatherData.main.pressure} hPa</p>
    `;

    var vision = document.getElementById('visibility');
    vision.innerHTML = `
        <p>Visibility:</br>${weatherData.visibility / 1000} km</p>
    `;
    
    var wind = document.getElementById('windSpd');
    wind.innerHTML = `
        <p>Wind Speed:</br>${(weatherData.wind.speed * 1.60934).toFixed(0)} km/h</p>
    `;

    var windDir = document.getElementById('windDirection');
    windDir.innerHTML = `
        <p>Wind Direction:</br>${weatherData.wind.deg} &deg; </p>
    `;

    var cloud = document.getElementById('cloudiness');
    cloud.innerHTML = `
        <p>Cloudiness:</br>${weatherData.clouds.all}%</p>
    `;

    var rise = document.getElementById('sunrise');
    rise.innerHTML = `
        <p>Sunrise:</br>${new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()}</p>
    `;

    var set = document.getElementById('sunset');
    set.innerHTML = `
        <p>Sunset:</br>${new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()}</p>
    `;
  }

  getWeatherByCity("Caracas");
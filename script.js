fetch("https://api.openweathermap.org/data/2.5/weather?lat=10.480594&lon=-66.903603&appid=4c2ea446b8fba1b6f13c58bda72e19b2")

  .then(response => response.json())

  .then(weatherData => {

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
        <p>Visibility:</br>${weatherData.visibility} meters</p>
    `;
    
    var wind = document.getElementById('windSpd');
    wind.innerHTML = `
        <p>Wind Speed:</br>${weatherData.wind.speed} m/s</p>
    `;

    var windDir = document.getElementById('windDirection');
    windDir.innerHTML = `
        <p>Wind Direction:</br>${weatherData.wind.deg} &deg;</p>
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
  })

  .catch(error => console.log('error', error));

//check for metric value convertion
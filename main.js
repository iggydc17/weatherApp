// Select DOM elements
const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const generalContainer = document.getElementById("general-container");
const card = document.querySelector(".card");
const weatherInfoContainer = document.getElementById("weather-info-container");
const welcomeMessageContainer = document.querySelector(".welcome-message-container");
const errorMessageContainer = document.querySelector(".error-message-container");

// API Key
const apiKey = "18e390d9cf622ee69e7b6194e60a9e84";

let weatherEmoji = "";
let weatherDescription = "";

// Form event
weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    const city = cityInput.value;

    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            displayWeatherInfo(weatherData);
            displayWeatherDetails(weatherData);
            updateUrl(city);
        } catch (error) {
            console.error(error);
            displayError(error.message);
            weatherForm.reset();
        }
    } else {
        displayError("Please enter a city.");
    }
});

// Get data from the API
const getWeatherData = async (city) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not find that city, try again!");
    }

    return await response.json();
}

// Display weather information
const displayWeatherInfo = (data) => {
    const { name: city, main: { temp, humidity }, weather: [{ description, id }], timezone, dt, sys: { country } } = data;
    const localTime = getLocalTime(dt, timezone);
    const temperatureCelsius = (temp - 273.15).toFixed(1);
    const isNight = isNightTime(localTime);
    const weatherEmoji = getWeatherEmoji(id, isNight);

    card.innerHTML = `
        <div class="tooltip">
            <button id="refresh-button" title=""><i class="bi bi-arrow-clockwise"></i></button>
            <div class="tooltip-text-refresh">Refresh</div>
        </div>
        <h1 class="city-display">${city} <span class="country-detail">${country}<span></h1>
        <p class="time-display">Local Time: ${localTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hs.</p>
        <div id="temp-and-unity-button-container">
            <p class="temp-display">${temperatureCelsius} °C</p>
            <div class="tooltip">
                <button id="change-unity-temp-btn" title=""><i class="bi bi-arrow-left-right"></i> F°</button>
                <div class="tooltip-text">Convert to Fahrenheit</div>
            </div
        </div>
        <div id="info-box">
            <p class="humidity-display">Humidity: ${humidity}%</p>
            <p class="desc-display">${description}</p>
            <p class="weather-emoji">${weatherEmoji}</p>
        </div>
    `;

    card.style.display = "flex";
    card.title = `The weather today in ${city}`;
    setCardBackgroundStyles(id, isNight);

    // Button events
    const refreshButton = document.getElementById("refresh-button");
    const changeUnityTempBtn = document.getElementById("change-unity-temp-btn");

    if (refreshButton) {
        refreshButton.addEventListener("click", async () => {
            const cityFromUrl = getCityFromUrl();
            if (cityFromUrl) {
                try {
                    const weatherData = await getWeatherData(cityFromUrl);
                    displayWeatherInfo(weatherData);
                    displayWeatherDetails(weatherData);
                    updateUrl(cityFromUrl);
                } catch (error) {
                    console.error(error);
                    displayError(error.message);
                }
            }
        });
    }
        
    let isFahrenheit = false;

    // Unit converter
    if (changeUnityTempBtn) {
        changeUnityTempBtn.addEventListener("click", () => {
            const tempDisplay = document.querySelector(".temp-display");
            const thermalDisplay = document.querySelector("#thermal-h1");
            const unityButton = document.getElementById("change-unity-temp-btn");
    
            const detailsTemperature = document.querySelector(".details-temperature");
            const detailsMinMax = document.querySelector(".details-minmax");
            const detailsWind = document.querySelector(".details-wind");
            const detailsVisibility = document.querySelector(".details-visibility");
            const tooltipText = document.querySelector(".tooltip-text");
    
            if (!isFahrenheit) {
                // To Fahrenheit
                const tempCelsius = parseFloat(tempDisplay.textContent);
                const tempFahrenheit = (tempCelsius * 9/5) + 32;
                tempDisplay.textContent = `${tempFahrenheit.toFixed(1)} °F`;
    
                const thermalCelsius = parseFloat(thermalDisplay.textContent);
                const thermalFahrenheit = (thermalCelsius * 9/5) + 32;
                thermalDisplay.textContent = `${thermalFahrenheit.toFixed(1)} °F`;
    
                const detailsCelsiusTemp = parseFloat(detailsTemperature.textContent.split(": ")[1]);
                const detailsFahrenheitTemp = (detailsCelsiusTemp * 9/5) + 32;
                detailsTemperature.innerHTML = ` <i class="bi bi-thermometer-high"></i> Temperature: ${detailsFahrenheitTemp.toFixed(1)} °F`;
    
                const [detailsCelsiusMin, detailsCelsiusMax] = detailsMinMax.textContent.split(": ")[1].split("/").map(temp => parseFloat(temp));
                const detailsFahrenheitMin = (detailsCelsiusMin * 9/5) + 32;
                const detailsFahrenheitMax = (detailsCelsiusMax * 9/5) + 32;
                detailsMinMax.innerHTML = ` <i class="bi bi-thermometer"></i> Min/Max: ${detailsFahrenheitMin.toFixed(1)}°F / ${detailsFahrenheitMax.toFixed(1)}°F`;
    
                const windSpeedKmh = parseFloat(detailsWind.textContent.split(": ")[1]);
                const windSpeedMph = (windSpeedKmh * 0.621371).toFixed(1);
                detailsWind.innerHTML = ` <i class="bi bi-wind"></i> Wind: ${windSpeedMph} mph`;

                const visibilityKm = parseFloat(detailsVisibility.textContent.split(": ")[1]);
                const visibilityMi = (visibilityKm * 0.621371).toFixed(1);
                detailsVisibility.innerHTML = ` <i class="bi bi-eye"></i> Visibility: ${visibilityMi} mi`;

                tooltipText.textContent = "Convert to Celsius";
    
                unityButton.dataset.unit = "fahrenheit";
                unityButton.innerHTML = '<i class="bi bi-arrow-left-right"></i> °C';
                isFahrenheit = true;
            } 
            else {
                // To Celsius
                const tempFahrenheit = parseFloat(tempDisplay.textContent);
                const tempCelsius = (tempFahrenheit - 32) * 5/9;
                tempDisplay.textContent = `${tempCelsius.toFixed(1)} °C`;
    
                const thermalFahrenheit = parseFloat(thermalDisplay.textContent);
                const thermalCelsius = (thermalFahrenheit - 32) * 5/9;
                thermalDisplay.textContent = `${thermalCelsius.toFixed(1)} °C`;
    
                const detailsFahrenheitTemp = parseFloat(detailsTemperature.textContent.split(": ")[1]);
                const detailsCelsiusTemp = (detailsFahrenheitTemp - 32) * 5/9;
                detailsTemperature.innerHTML = ` <i class="bi bi-thermometer-high"></i>Temperature: ${detailsCelsiusTemp.toFixed(1)} °C`;
    
                const [detailsFahrenheitMin, detailsFahrenheitMax] = detailsMinMax.textContent.split(": ")[1].split("/").map(temp => parseFloat(temp));
                const detailsCelsiusMin = (detailsFahrenheitMin - 32) * 5/9;
                const detailsCelsiusMax = (detailsFahrenheitMax - 32) * 5/9;
                detailsMinMax.innerHTML = ` <i class="bi bi-thermometer"></i> Min/Max: ${detailsCelsiusMin.toFixed(1)}°C / ${detailsCelsiusMax.toFixed(1)}°C`;
    
                const windSpeedMph = parseFloat(detailsWind.textContent.split(": ")[1]);
                const windSpeedKmh = (windSpeedMph / 0.621371).toFixed(1);
                detailsWind.innerHTML = ` <i class="bi bi-wind"></i> Wind: ${windSpeedKmh} km/h`;

                const visibilityMi = parseFloat(detailsVisibility.textContent.split(": ")[1]);
                const visibilityKm = (visibilityMi / 0.621371).toFixed(1);
                detailsVisibility.innerHTML = ` <i class="bi bi-eye"></i> Visibility: ${visibilityKm} km`;
    
                tooltipText.textContent = "Convert to Fahrenheit";

                unityButton.dataset.unit = "celsius";
                unityButton.innerHTML = '<i class="bi bi-arrow-left-right"></i> °F';
                isFahrenheit = false;
            }
        });
    }
}

// Format timezone
const getLocalTime = (timestamp, timezoneOffset) => {
    const utcTime = new Date(timestamp * 1000); 
    const localOffset = utcTime.getTimezoneOffset() * 60000; 
    const localTime = new Date(utcTime.getTime() + (timezoneOffset * 1000) + localOffset); 
    return localTime;
};

// Determine if it's night time
const isNightTime = (localTime) => {
    const hours = localTime.getHours();
    return hours >= 18 || hours < 6; 
}

// Weather emoji
const getWeatherEmoji = (weatherId, isNight, isDetailSection = false) => {
    if (!isDetailSection) {
        return isNight ? "🌙" : getDaytimeEmoji(weatherId);
    } else {
        return getDaytimeEmoji(weatherId);
    }
}

const getDaytimeEmoji = (weatherId) => {
    switch (true) {
        case (weatherId >= 200 && weatherId < 300):
            return "⛈️";
        case (weatherId >= 300 && weatherId < 400):
            return "🌦️";
        case (weatherId >= 500 && weatherId < 600):
            return "🌧️";
        case (weatherId >= 600 && weatherId < 700):
            return "❄️";
        case (weatherId >= 700 && weatherId < 800):
            return "🌫️";
        case (weatherId === 800):
            return "☀️";
        case (weatherId === 801):
            return "🌤️";
        case (weatherId === 802):
            return "⛅";
        case (weatherId >= 803 && weatherId <= 804):
            return "☁️";
        case (weatherId >= 900 && weatherId < 910):
            return "🌬️";
        case (weatherId >= 900 && weatherId < 1000):
            return "🌪️";
        default:
            return "🌈";
    }
}

// Set card background
const setCardBackgroundStyles = (weatherId, isNight) => {
    card.className = "card"; 
    if (isNight) {
        card.classList.add("night");
    } else if (weatherId >= 200 && weatherId < 300) {
        card.classList.add("stormy");
    } else if (weatherId >= 300 && weatherId < 400 || weatherId >= 500 && weatherId < 600) {
        card.classList.add("rainy");
    } else if (weatherId >= 600 && weatherId < 700) {
        card.classList.add("snowy");
    } else if (weatherId >= 700 && weatherId < 800 || weatherId >= 803 && weatherId <= 804) {
        card.classList.add("cloudy");
    } else if (weatherId === 800 || weatherId === 801 || weatherId === 802) {
        card.classList.add("sunny");
    } else {
        card.classList.add("default");
    }
}

// Weather details
const displayWeatherDetails = async (data) => {
    const { name: city, main: { temp, feels_like, humidity, temp_min, temp_max, pressure }, weather: [{ description, id }], visibility, wind: { speed }, sys: { country }, timezone } = data;

    const temperature = (temp - 273.15).toFixed(1);
    const feelsLikeCelsius = (feels_like - 273.15).toFixed(1);
    const tempMinCelsius = (temp_min - 273.15).toFixed(1);
    const tempMaxCelsius = (temp_max - 273.15).toFixed(1);
    const visibilityKm = (visibility / 1000).toFixed(2);

    const isNight = isNightTime(getLocalTime(Date.now(), timezone));

    weatherInfoContainer.innerHTML = `
        <div id="details-title">
            <h3>${description.charAt(0).toUpperCase() + description.slice(1)} in ${city} <span class="country">(${country})</span> right now:</h3>
        </div>
        <div id="thermal-sensation-and-emoji">
            <div id="thermal-sensation">
                <p id="thermal-p">Thermal Sensation</p>
                <h1 id="thermal-h1">${feelsLikeCelsius} °C</h1>
            </div>
            <p class="weather-emoji-detail">${getWeatherEmoji(id, isNight, true)}</p>
        </div>
        <div id="details-grid">
            <p class="details-temperature"> <i class="bi bi-thermometer-high"></i> Temperature: ${temperature} °C</p>
            <p class="details-minmax"> <i class="bi bi-thermometer"></i> Min/Max: ${tempMinCelsius}°C / ${tempMaxCelsius}°C</p>
            <p> <i class="bi bi-speedometer"></i> Pressure: ${pressure.toFixed(1)} mb</p>
            <p class="details-visibility"> <i class="bi bi-eye"></i> Visibility: ${visibilityKm} km</p>
            <p> <i class="bi bi-droplet-fill"></i> Humidity: ${humidity}%</p>
            <p class="details-wind"> <i class="bi bi-wind"></i> Wind: ${speed} km/h</p>
        </div>
    `;

    weatherInfoContainer.title = `The details of the weather for today in ${city}`;
    weatherInfoContainer.style.display = "block";

    weatherEmoji = getWeatherEmoji(id, isNight, true);
    weatherDescription = data.weather[0].description;

    return { weatherEmoji, weatherDescription };
};

// Update URL with weather information
const updateUrl = (city) => {
    const newUrl = `${window.location.origin}${window.location.pathname}?city=${city}`;
    history.pushState({ path: newUrl }, '', newUrl);
}

// Get city from URL
const getCityFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('city');
}

// Display error
const displayError = (message) => {
    generalContainer.textContent = ""; 

    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    generalContainer.classList.add("error-message-container");

    errorMessageContainer.style.display = "flex";
    generalContainer.appendChild(errorDisplay);

    setTimeout(() => {
        location.reload();
    }, 1500);
}

// USER LOCATION & TIME SECTION ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Show User Location, Time and Weather
const showPosition = async (position) => {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    const reverseGeocodeUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await fetch(reverseGeocodeUrl);
        const data = await response.json();
        const city = data.name;

        const weatherData = await getWeatherData(city);
        userWeatherEmoji = getWeatherEmoji(weatherData.weather[0].id, isNightTime(getLocalTime(Date.now(), weatherData.timezone)), true);
        userWeatherDescription = weatherData.weather[0].description;

        document.getElementById('location').innerHTML = `Approximate Location: <button id="weather-location-button"><strong>${city}</strong></button> | `;
        
        displayWeatherInfo(weatherData);
        displayWeatherDetails(weatherData);
        updateUrl(city);

        const weatherLocationButton = document.getElementById("weather-location-button");
        weatherLocationButton.title = `${city} climate information `;
        weatherLocationButton.addEventListener("click", async () => {
            try {
                const weatherData = await getWeatherData(city);
                displayWeatherInfo(weatherData);
                displayWeatherDetails(weatherData);
                updateUrl(city);
                weatherForm.reset();
            } catch (error) {
                console.error('Error getting weather data:', error);
                displayError('Unable to retrieve weather information.');
            }
        });
    } catch (error) {
        console.error('Error getting city name:', error);
        document.getElementById('location').innerHTML = "Unable to retrieve city name.";
        document.getElementById('location').style.color = "tomato";
    }
};

// Show Types Errors
const showError = (error) => {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("The user denied the request for geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get the user's location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
    alert("Geolocation is not supported by this browser.");
}

// Display local time
const showTime = () => {
    let now = new Date(); 
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    minutes = minutes < 10 ? '0' + minutes : minutes; 
    seconds = seconds < 10 ? '0' + seconds : seconds; 
    let timeString = hours + ":" + minutes + ":" + seconds;
    
    document.getElementById('time').innerHTML = `&nbsp <strong>${timeString}</strong> ${userWeatherEmoji}`;
    document.getElementById('time').title = `${userWeatherDescription.charAt(0).toUpperCase() + userWeatherDescription.slice(1)} day`;
};

setInterval(showTime, 1000);


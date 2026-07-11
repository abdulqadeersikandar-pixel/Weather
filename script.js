const API_KEY = "a2021ee1a4c59c221115380b763b3111";


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const empty = document.getElementById("empty");

const weatherContainer = document.getElementById("weatherContainer");

const cityName = document.getElementById("cityName");
const todayDate = document.getElementById("todayDate");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

const hourlyContainer = document.getElementById("hourlyContainer");
const forecastContainer = document.getElementById("forecastContainer");

function showLoading() {

    loading.classList.remove("hidden");
    error.classList.add("hidden");
    empty.classList.add("hidden");
    searchBtn.disabled = true;
locationBtn.disabled = true;

}

function hideLoading() {

    loading.classList.add("hidden");
    searchBtn.disabled = false;
locationBtn.disabled = false;

}

function showError(message) {

    hideLoading();

    error.classList.remove("hidden");
    error.textContent = message;

    weatherContainer.classList.add("hidden");

}

function hideError() {

    error.classList.add("hidden");

}

function saveCache(data) {

    localStorage.setItem(
        "weatherData",
        JSON.stringify(data)
    );

}

function loadCache() {

    const cache = localStorage.getItem("weatherData");

    if (!cache) return;

    const data = JSON.parse(cache);

    renderCurrentWeather(data.current);

    renderHourlyForecast(data.forecast);

    renderFiveDayForecast(data.forecast);

    weatherContainer.classList.remove("hidden");

    empty.classList.add("hidden");

}
async function fetchWeather(city) {

    try {

        showLoading();

        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!currentResponse.ok) {
            throw new Error("City not found.");
        }

        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!forecastResponse.ok) {
            throw new Error("Unable to load forecast.");
        }

        const forecastData = await forecastResponse.json();

        renderCurrentWeather(currentData);

        renderHourlyForecast(forecastData);

        renderFiveDayForecast(forecastData);

        saveCache({
            current: currentData,
            forecast: forecastData
        });

        hideLoading();

        hideError();

        empty.classList.add("hidden");

        weatherContainer.classList.remove("hidden");

    }

    catch(err){

        showError(err.message);

    }

}

async function fetchWeatherByLocation(lat, lon){

    try{

        showLoading();

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );

        if(!response.ok){

            throw new Error("Unable to detect location.");

        }

        const data = await response.json();

        fetchWeather(data.name);

    }

    catch(err){

        showError(err.message);

    }

}

searchBtn.addEventListener("click", ()=>{

    const city = cityInput.value.trim();

    if(city===""){

        alert("Please enter a city name.");

        return;

    }

    fetchWeather(city);

});

cityInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        searchBtn.click();

    }

});

locationBtn.addEventListener("click",()=>{

    if(!navigator.geolocation){

        showError("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        position=>{

            fetchWeatherByLocation(

                position.coords.latitude,

                position.coords.longitude

            );

        },

        ()=>{

            showError("Location permission denied.");

        }

    );

});
function renderCurrentWeather(data) {

    cityName.textContent = `${data.name}, ${data.sys.country}`;

    todayDate.textContent = new Date().toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    description.textContent =
        data.weather[0].description;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;

    humidity.textContent =
        `${data.main.humidity}%`;

    wind.textContent =
        `${data.wind.speed} m/s`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    weatherIcon.alt =
        data.weather[0].description;

}

function formatTime(dateString){

    const date = new Date(dateString);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour:"numeric",
            minute:"2-digit"
        }
    );

}

function formatDay(dateString){

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-US",
        {
            weekday:"short"
        }
    );

}
function renderHourlyForecast(data) {

    hourlyContainer.innerHTML = "";

    data.list.slice(0, 8).forEach(hour => {

        hourlyContainer.innerHTML += `
            <div class="hour-card">
                <h4>${formatTime(hour.dt_txt)}</h4>

                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png"
                     alt="${hour.weather[0].description}">

                <h3>${Math.round(hour.main.temp)}°C</h3>

                <p>${hour.weather[0].main}</p>
            </div>
        `;

    });

}

function renderFiveDayForecast(data) {

    forecastContainer.innerHTML = "";

    const days = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    days.slice(0, 5).forEach(day => {

        forecastContainer.innerHTML += `
            <div class="forecast-card">

                <h3>${formatDay(day.dt_txt)}</h3>

                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
                     alt="${day.weather[0].description}">

                <h2>${Math.round(day.main.temp)}°C</h2>

                <p>${day.weather[0].description}</p>

            </div>
        `;

    });

}

window.addEventListener("load", () => {

    loadCache();

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

            position => {

                fetchWeatherByLocation(
                    position.coords.latitude,
                    position.coords.longitude
                );

            },

            () => {

                empty.classList.remove("hidden");

            }

        );

    } else {

        empty.classList.remove("hidden");

    }

});
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const sections = document.querySelectorAll("section");
const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const unitTypeSlider = document.querySelector("#unit-slider");
const forecastItemTemplate = document.querySelector("#forecast-item-template");
const forecastItemsContainer = document.querySelector(
  ".forecast-items-container"
);

const apiKey = "3d8cbf24d46a6eac683399825e17b0fe";
let unitType = "imperial";
let selectedCity;
let unitTempSymbol = "°F";
let unitWindType = "mph";

searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() != "") {
    selectedCity = cityInput.value;
    console.log(selectedCity);
    updateWeatherInfo(cityInput.value, unitType);
    cityInput.value = "";
    cityInput.blur();
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key == "Enter" && cityInput.value != "") {
    selectedCity = cityInput.value;
    updateWeatherInfo(cityInput.value, unitType);
    cityInput.value = "";
    cityInput.blur();
  }
});

unitTypeSlider.addEventListener("click", () => {
  if (unitType === "imperial") {
    unitType = "metric";
    unitTempSymbol = "°C";
    unitWindType = "m/s";
    updateWeatherInfo(selectedCity, unitType);
  } else {
    unitType = "imperial";
    unitTempSymbol = "°F";
    unitWindType = "mph";
    updateWeatherInfo(selectedCity, unitType);
  }
});

async function getFetchData(endpoint, city, unitType) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=${unitType}`;

  const response = await fetch(apiUrl);

  return response.json();
}

function getWeatherIcon(id) {
  return id <= 232
    ? "thunderstorm.svg"
    : id <= 321
    ? "drizzle.svg"
    : id <= 531
    ? "rain.svg"
    : id <= 622
    ? "snow.svg"
    : id <= 781
    ? "atmosphere.svg"
    : id <= 800
    ? "clear.svg"
    : "clouds.svg";

  // if (id <= 232) return "thunderstorm.svg";
  // if (id <= 321) return "drizzle.svg";
  // if (id <= 531) return "rain.svg";
  // if (id <= 622) return "snow.svg";
  // if (id <= 781) return "atmosphere.svg";
  // if (id <= 800) return "clear.svg";
  // else return "clouds.svg";
}

function getCurrentDate() {
  const currentDate = new Date();

  const options = {
    weekday: "short",
    day: "2-digit",
    month: "short",
  };
  return currentDate.toLocaleDateString("en-US", options);
}

async function updateWeatherInfo(city, unitType) {
  const weatherData = await getFetchData("weather", city, unitType);
  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: country,
    main: { humidity, temp },
    weather: [{ id, main }],
    wind: { speed },
  } = weatherData;

  countryTxt.textContent = country;
  tempTxt.textContent = Math.round(temp) + " " + unitTempSymbol;
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + "%";
  windValueTxt.textContent = Math.round(speed) + " " + unitWindType;

  currentDateTxt.textContent = getCurrentDate();
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

  await updateForecastInfo(city, unitType);
  showDisplaySection(weatherInfoSection);
}

async function updateForecastInfo(city, unitType) {
  const forecastData = await getFetchData("forecast", city, unitType);
  const timeTaken = "12:00:00";
  const todaysDate = new Date().toISOString().split("T")[0];

  forecastItemsContainer.textContent = "";

  forecastData.list.forEach((date) => {
    if (date.dt_txt.includes(timeTaken) && !date.dt_txt.includes(todaysDate)) {
      updateForecastItems(date);
    }
  });
}

function updateForecastItems(dateData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = dateData;

  const dateTaken = new Date(date);
  const dateOptions = {
    weekday: "short",
  };

  const dateResult = dateTaken.toLocaleDateString("en-US", dateOptions);

  const forecastElement = document.importNode(
    forecastItemTemplate.content,
    true
  );

  forecastItemDate = forecastElement.querySelector("[data-template-date]");
  forecastItemImg = forecastElement.querySelector("[data-template-img]");
  forecastItemTemp = forecastElement.querySelector("[data-template-temp]");

  forecastItemDate.textContent = dateResult;
  forecastItemImg.src = `assets/weather/${getWeatherIcon(id)}`;
  forecastItemTemp.textContent = Math.round(temp) + " " + unitTempSymbol;

  forecastItemsContainer.appendChild(forecastElement);
}

function showDisplaySection(section) {
  sections.forEach((section) => (section.style.display = "none"));
  section.style.display = "flex";
}

import {
  getWeatherIcon,
  getWeatherGradient,
  getWindDirection,
  getAQILabel,
  getAQIColor,
  formatSunTime,
  formatHourlyTime,
  formatVisibility,
  getDailyForecasts,
  getTodayHourly,
} from "./utils.js";

// ── DOM references ───────────────────────────────────────────────────────────

const cityInput = document.querySelector(".search-bar__input");
const searchBtn = document.querySelector(".search-bar__btn--search");
const geoBtn = document.querySelector(".search-bar__btn--geo");
const recentSearchesEl = document.querySelector(".recent-searches");

const sections = document.querySelectorAll("section");
const notFoundSection = document.querySelector(".not-found");
const notFoundMsgTxt = document.querySelector(".not-found__message");
const weatherInfoSection = document.querySelector(".weather-info");
const loadingSection = document.querySelector(".loading");

const cityTxt = document.querySelector(".weather-hero__city");
const dateTxt = document.querySelector(".weather-hero__date");

const weatherMainIcon = document.querySelector(".weather-main__icon");
const tempTxt = document.querySelector(".weather-main__temp");
const feelsLikeTxt = document.querySelector(".weather-main__feels-like");
const highLowTxt = document.querySelector(".weather-main__high-low");
const conditionTxt = document.querySelector(".weather-main__condition");

const unitSlider = document.querySelector("#unit-slider");
const humidityValueTxt = document.querySelector(".humidity-value-txt");
const windValueTxt = document.querySelector(".wind-value-txt");
const pressureValueTxt = document.querySelector(".pressure-value-txt");
const visibilityValueTxt = document.querySelector(".visibility-value-txt");
const sunriseValueTxt = document.querySelector(".sunrise-value-txt");
const sunsetValueTxt = document.querySelector(".sunset-value-txt");

const aqiLabel = document.querySelector(".aqi__label");
const aqiFill = document.querySelector(".aqi__fill");

const hourlyList = document.querySelector(".hourly-forecast__list");
const dailyList = document.querySelector(".daily-forecast__list");

const hourlyItemTemplate = document.querySelector("#hourly-item-template");
const forecastItemTemplate = document.querySelector("#forecast-item-template");

const card = document.querySelector(".card");

// ── State ────────────────────────────────────────────────────────────────────

const apiKey = window.WEATHER_APP_CONFIG?.apiKey;
let unitType = "imperial";
let unitTempSymbol = "°F";
let unitWindLabel = "mph";
let selectedCity = null;

// ── Recent searches (localStorage) ──────────────────────────────────────────

function loadRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem("recentSearches") ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(city) {
  const recent = loadRecentSearches().filter(
    (c) => c.toLowerCase() !== city.toLowerCase(),
  );
  localStorage.setItem(
    "recentSearches",
    JSON.stringify([city, ...recent].slice(0, 3)),
  );
}

function renderRecentSearches() {
  const recent = loadRecentSearches();
  recentSearchesEl.innerHTML = "";
  recent.forEach((city) => {
    const chip = document.createElement("button");
    chip.className = "recent-searches__chip";
    chip.textContent = city;
    chip.addEventListener("click", () => {
      selectedCity = city;
      updateWeatherInfo(city, unitType);
    });
    recentSearchesEl.appendChild(chip);
  });
}

// ── API ──────────────────────────────────────────────────────────────────────

async function fetchWeather(endpoint, params) {
  const query = new URLSearchParams({ ...params, appid: apiKey }).toString();
  const url = `https://api.openweathermap.org/data/2.5/${endpoint}?${query}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

// ── UI helpers ───────────────────────────────────────────────────────────────

function showSection(section) {
  sections.forEach((s) => (s.style.display = "none"));
  section.style.display = "flex";
}

function setLoading(isLoading) {
  cityInput.disabled = isLoading;
  searchBtn.disabled = isLoading;
  geoBtn.disabled = isLoading;
  if (isLoading) showSection(loadingSection);
}

function showError(message) {
  notFoundMsgTxt.textContent = message;
  showSection(notFoundSection);
}

function getCurrentDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function getTodayDateStr() {
  return new Date().toISOString().split("T")[0];
}

// ── Render helpers ───────────────────────────────────────────────────────────

function renderCurrentWeather(data) {
  const {
    name,
    main: { temp, feels_like, temp_max, temp_min, humidity, pressure },
    weather: [{ id, description }],
    wind: { speed, deg },
    visibility,
    sys: { sunrise, sunset },
    timezone,
    coord: { lat, lon },
  } = data;

  const now = Date.now() / 1000;
  const isDaytime = now >= sunrise && now <= sunset;

  cityTxt.textContent = name;
  dateTxt.textContent = getCurrentDate();

  weatherMainIcon.src = `assets/weather/${getWeatherIcon(id)}`;
  tempTxt.textContent = `${Math.round(temp)} ${unitTempSymbol}`;
  feelsLikeTxt.textContent = `Feels like ${Math.round(feels_like)} ${unitTempSymbol}`;
  highLowTxt.textContent = `H: ${Math.round(temp_max)}°  L: ${Math.round(temp_min)}°`;
  conditionTxt.textContent =
    description.charAt(0).toUpperCase() + description.slice(1);

  humidityValueTxt.textContent = `${humidity}%`;
  windValueTxt.textContent = `${Math.round(speed)} ${unitWindLabel} ${getWindDirection(deg)}`;
  pressureValueTxt.textContent = `${pressure} hPa`;
  visibilityValueTxt.textContent = formatVisibility(visibility, unitType);
  sunriseValueTxt.textContent = formatSunTime(sunrise, timezone);
  sunsetValueTxt.textContent = formatSunTime(sunset, timezone);

  card.style.setProperty("--card-gradient", getWeatherGradient(id, isDaytime));

  return { lat, lon };
}

function renderAQI(aqiData) {
  const aqi = aqiData?.list?.[0]?.main?.aqi;
  if (!aqi) return;
  const color = getAQIColor(aqi);
  aqiLabel.textContent = getAQILabel(aqi);
  aqiLabel.style.color = color;
  aqiFill.parentElement.setAttribute("aria-valuenow", aqi);
  aqiFill.style.width = `${(aqi / 5) * 100}%`;
  aqiFill.style.backgroundColor = color;
}

function renderHourlyForecast(forecastData) {
  const hourlyItems = getTodayHourly(forecastData.list, getTodayDateStr());
  hourlyList.innerHTML = "";
  hourlyItems.forEach(({ time, temp, iconId }) => {
    const el = document.importNode(hourlyItemTemplate.content, true);
    el.querySelector("[data-template-time]").textContent =
      formatHourlyTime(time);
    el.querySelector("[data-template-img]").src =
      `assets/weather/${getWeatherIcon(iconId)}`;
    el.querySelector("[data-template-temp]").textContent =
      `${temp} ${unitTempSymbol}`;
    hourlyList.appendChild(el);
  });
}

function renderDailyForecast(forecastData) {
  const days = getDailyForecasts(forecastData.list, getTodayDateStr());
  dailyList.innerHTML = "";
  days.forEach(({ date, high, low, iconId }) => {
    const dayLabel = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const el = document.importNode(forecastItemTemplate.content, true);
    el.querySelector("[data-template-date]").textContent = dayLabel;
    el.querySelector("[data-template-img]").src =
      `assets/weather/${getWeatherIcon(iconId)}`;
    el.querySelector("[data-template-temp]").textContent =
      `${high} ${unitTempSymbol}`;
    el.querySelector("[data-template-range]").textContent = `L: ${low}°`;
    dailyList.appendChild(el);
  });
}

// ── Core update flow ─────────────────────────────────────────────────────────

async function updateWeatherInfo(city, units) {
  setLoading(true);
  try {
    const weatherData = await fetchWeather("weather", { q: city, units });
    const { lat, lon } = renderCurrentWeather(weatherData);

    const [forecastData, aqiData] = await Promise.all([
      fetchWeather("forecast", { q: city, units }),
      fetchWeather("air_pollution", { lat, lon }),
    ]);

    renderHourlyForecast(forecastData);
    renderDailyForecast(forecastData);
    renderAQI(aqiData);

    saveRecentSearch(city);
    renderRecentSearches();

    showSection(weatherInfoSection);
  } catch {
    showError("Something went wrong — check your connection and try again");
  } finally {
    setLoading(false);
  }
}

async function updateWeatherInfoByCoords(lat, lon, units) {
  setLoading(true);
  try {
    const weatherData = await fetchWeather("weather", { lat, lon, units });
    renderCurrentWeather(weatherData);

    const [forecastData, aqiData] = await Promise.all([
      fetchWeather("forecast", { lat, lon, units }),
      fetchWeather("air_pollution", { lat, lon }),
    ]);

    renderHourlyForecast(forecastData);
    renderDailyForecast(forecastData);
    renderAQI(aqiData);

    selectedCity = weatherData.name;
    saveRecentSearch(weatherData.name);
    renderRecentSearches();

    showSection(weatherInfoSection);
  } catch {
    showError("Something went wrong — check your connection and try again");
  } finally {
    setLoading(false);
  }
}

// ── Event listeners ──────────────────────────────────────────────────────────

function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) return;
  selectedCity = city;
  updateWeatherInfo(city, unitType);
  cityInput.value = "";
  cityInput.blur();
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

unitSlider.addEventListener("change", () => {
  if (unitSlider.checked) {
    unitType = "metric";
    unitTempSymbol = "°C";
    unitWindLabel = "m/s";
  } else {
    unitType = "imperial";
    unitTempSymbol = "°F";
    unitWindLabel = "mph";
  }
  if (selectedCity) updateWeatherInfo(selectedCity, unitType);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      updateWeatherInfoByCoords(latitude, longitude, unitType);
    },
    () => {
      showError(
        "Unable to determine your location — please allow location access",
      );
      setLoading(false);
    },
  );
});

// ── Init ─────────────────────────────────────────────────────────────────────

renderRecentSearches();

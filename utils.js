const WEATHER_ICONS = Object.freeze({
  thunderstorm: "thunderstorm.svg",
  drizzle: "drizzle.svg",
  rain: "rain.svg",
  snow: "snow.svg",
  atmosphere: "atmosphere.svg",
  clear: "clear.svg",
  clouds: "clouds.svg",
});

export function getWeatherIcon(id) {
  if (id <= 232) return WEATHER_ICONS.thunderstorm;
  if (id <= 321) return WEATHER_ICONS.drizzle;
  if (id <= 531) return WEATHER_ICONS.rain;
  if (id <= 622) return WEATHER_ICONS.snow;
  if (id <= 781) return WEATHER_ICONS.atmosphere;
  if (id <= 800) return WEATHER_ICONS.clear;
  return WEATHER_ICONS.clouds;
}

const GRADIENTS = Object.freeze({
  thunderstorm:
    "linear-gradient(160deg, rgba(30, 20, 60, 0.85), rgba(60, 30, 80, 0.85))",
  drizzle:
    "linear-gradient(160deg, rgba(30, 60, 120, 0.75), rgba(50, 80, 140, 0.75))",
  rain: "linear-gradient(160deg, rgba(20, 50, 100, 0.85), rgba(30, 70, 130, 0.85))",
  snow: "linear-gradient(160deg, rgba(160, 190, 220, 0.75), rgba(180, 210, 240, 0.75))",
  atmosphere:
    "linear-gradient(160deg, rgba(100, 100, 110, 0.75), rgba(120, 120, 130, 0.75))",
  clearDay:
    "linear-gradient(160deg, rgba(220, 100, 30, 0.65), rgba(240, 160, 50, 0.6))",
  clearNight:
    "linear-gradient(160deg, rgba(10, 25, 70, 0.85), rgba(20, 50, 110, 0.8))",
  clouds:
    "linear-gradient(160deg, rgba(70, 90, 120, 0.75), rgba(90, 110, 145, 0.75))",
});

export function getWeatherGradient(weatherId, isDaytime = true) {
  if (weatherId <= 232) return GRADIENTS.thunderstorm;
  if (weatherId <= 321) return GRADIENTS.drizzle;
  if (weatherId <= 531) return GRADIENTS.rain;
  if (weatherId <= 622) return GRADIENTS.snow;
  if (weatherId <= 781) return GRADIENTS.atmosphere;
  if (weatherId === 800)
    return isDaytime ? GRADIENTS.clearDay : GRADIENTS.clearNight;
  return GRADIENTS.clouds;
}

const WIND_DIRECTIONS = Object.freeze([
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
]);

export function getWindDirection(degrees) {
  return WIND_DIRECTIONS[Math.round(degrees / 45) % 8];
}

const AQI_LABELS = Object.freeze([
  "",
  "Good",
  "Fair",
  "Moderate",
  "Poor",
  "Very Poor",
]);
const AQI_COLORS = Object.freeze([
  "",
  "#4CAF50",
  "#FFEB3B",
  "#FF9800",
  "#F44336",
  "#9C27B0",
]);

export function getAQILabel(aqi) {
  return AQI_LABELS[aqi] ?? "Unknown";
}

export function getAQIColor(aqi) {
  return AQI_COLORS[aqi] ?? "#999";
}

export function formatSunTime(unixTimestamp, timezoneOffsetSeconds) {
  const localDate = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
  const hours = localDate.getUTCHours();
  const minutes = localDate.getUTCMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

export function formatHourlyTime(timeStr) {
  const hour = parseInt(timeStr.split(":")[0], 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${ampm}`;
}

export function formatVisibility(meters, unitType) {
  if (unitType === "imperial") {
    return `${(meters / 1609.34).toFixed(1)} mi`;
  }
  return `${Math.round(meters / 1000)} km`;
}

export function getDailyForecasts(forecastList, todayDateStr) {
  const byDay = {};

  for (const item of forecastList) {
    const dateStr = item.dt_txt.split(" ")[0];
    if (dateStr === todayDateStr) continue;

    if (!byDay[dateStr]) {
      byDay[dateStr] = {
        high: -Infinity,
        low: Infinity,
        noonItem: null,
        firstItem: item,
      };
    }

    byDay[dateStr].high = Math.max(byDay[dateStr].high, item.main.temp_max);
    byDay[dateStr].low = Math.min(byDay[dateStr].low, item.main.temp_min);

    if (item.dt_txt.includes("12:00:00")) {
      byDay[dateStr].noonItem = item;
    }
  }

  return Object.entries(byDay).map(([date, data]) => {
    const representative = data.noonItem ?? data.firstItem;
    return {
      date,
      high: Math.round(data.high),
      low: Math.round(data.low),
      iconId: representative.weather[0].id,
    };
  });
}

export function getTodayHourly(forecastList, todayDateStr) {
  return forecastList
    .filter((item) => item.dt_txt.startsWith(todayDateStr))
    .map((item) => ({
      time: item.dt_txt.split(" ")[1].slice(0, 5),
      temp: Math.round(item.main.temp),
      iconId: item.weather[0].id,
    }));
}

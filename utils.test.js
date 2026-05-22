import { describe, it, expect } from "vitest";
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

// ── getWeatherIcon ──────────────────────────────────────────────────────────

describe("getWeatherIcon", () => {
  it("returns thunderstorm.svg for id 200", () => {
    expect(getWeatherIcon(200)).toBe("thunderstorm.svg");
  });
  it("returns thunderstorm.svg for id 232 (boundary)", () => {
    expect(getWeatherIcon(232)).toBe("thunderstorm.svg");
  });
  it("returns drizzle.svg for id 300", () => {
    expect(getWeatherIcon(300)).toBe("drizzle.svg");
  });
  it("returns drizzle.svg for id 321 (boundary)", () => {
    expect(getWeatherIcon(321)).toBe("drizzle.svg");
  });
  it("returns rain.svg for id 500", () => {
    expect(getWeatherIcon(500)).toBe("rain.svg");
  });
  it("returns rain.svg for id 531 (boundary)", () => {
    expect(getWeatherIcon(531)).toBe("rain.svg");
  });
  it("returns snow.svg for id 600", () => {
    expect(getWeatherIcon(600)).toBe("snow.svg");
  });
  it("returns snow.svg for id 622 (boundary)", () => {
    expect(getWeatherIcon(622)).toBe("snow.svg");
  });
  it("returns atmosphere.svg for id 741", () => {
    expect(getWeatherIcon(741)).toBe("atmosphere.svg");
  });
  it("returns atmosphere.svg for id 781 (boundary)", () => {
    expect(getWeatherIcon(781)).toBe("atmosphere.svg");
  });
  it("returns clear.svg for id 800", () => {
    expect(getWeatherIcon(800)).toBe("clear.svg");
  });
  it("returns clouds.svg for id 801", () => {
    expect(getWeatherIcon(801)).toBe("clouds.svg");
  });
  it("returns clouds.svg for id 804", () => {
    expect(getWeatherIcon(804)).toBe("clouds.svg");
  });
});

// ── getWeatherGradient ──────────────────────────────────────────────────────

describe("getWeatherGradient", () => {
  it("returns a gradient string for thunderstorm", () => {
    expect(getWeatherGradient(200)).toContain("gradient");
  });
  it("returns a different gradient for clear daytime vs nighttime", () => {
    const day = getWeatherGradient(800, true);
    const night = getWeatherGradient(800, false);
    expect(day).not.toBe(night);
  });
  it("returns a gradient string for each weather category", () => {
    for (const id of [300, 500, 600, 741, 800, 804]) {
      expect(getWeatherGradient(id)).toContain("gradient");
    }
  });
});

// ── getWindDirection ────────────────────────────────────────────────────────

describe("getWindDirection", () => {
  it("returns N for 0 degrees", () => {
    expect(getWindDirection(0)).toBe("N");
  });
  it("returns N for 360 degrees", () => {
    expect(getWindDirection(360)).toBe("N");
  });
  it("returns NE for 45 degrees", () => {
    expect(getWindDirection(45)).toBe("NE");
  });
  it("returns E for 90 degrees", () => {
    expect(getWindDirection(90)).toBe("E");
  });
  it("returns SE for 135 degrees", () => {
    expect(getWindDirection(135)).toBe("SE");
  });
  it("returns S for 180 degrees", () => {
    expect(getWindDirection(180)).toBe("S");
  });
  it("returns SW for 225 degrees", () => {
    expect(getWindDirection(225)).toBe("SW");
  });
  it("returns W for 270 degrees", () => {
    expect(getWindDirection(270)).toBe("W");
  });
  it("returns NW for 315 degrees", () => {
    expect(getWindDirection(315)).toBe("NW");
  });
});

// ── getAQILabel ─────────────────────────────────────────────────────────────

describe("getAQILabel", () => {
  it("returns Good for AQI 1", () => expect(getAQILabel(1)).toBe("Good"));
  it("returns Fair for AQI 2", () => expect(getAQILabel(2)).toBe("Fair"));
  it("returns Moderate for AQI 3", () =>
    expect(getAQILabel(3)).toBe("Moderate"));
  it("returns Poor for AQI 4", () => expect(getAQILabel(4)).toBe("Poor"));
  it("returns Very Poor for AQI 5", () =>
    expect(getAQILabel(5)).toBe("Very Poor"));
});

// ── getAQIColor ─────────────────────────────────────────────────────────────

describe("getAQIColor", () => {
  it("returns green (#4CAF50) for AQI 1", () =>
    expect(getAQIColor(1)).toBe("#4CAF50"));
  it("returns yellow (#FFEB3B) for AQI 2", () =>
    expect(getAQIColor(2)).toBe("#FFEB3B"));
  it("returns orange (#FF9800) for AQI 3", () =>
    expect(getAQIColor(3)).toBe("#FF9800"));
  it("returns red (#F44336) for AQI 4", () =>
    expect(getAQIColor(4)).toBe("#F44336"));
  it("returns purple (#9C27B0) for AQI 5", () =>
    expect(getAQIColor(5)).toBe("#9C27B0"));
});

// ── formatSunTime ───────────────────────────────────────────────────────────

describe("formatSunTime", () => {
  // 1716357600 = 2024-05-22 06:00:00 UTC
  const SIX_AM_UTC = 1716357600;

  it("formats timestamp to 12-hour time string", () => {
    const result = formatSunTime(SIX_AM_UTC, 0);
    expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });
  it("returns 6:00 AM for 6 AM UTC with offset 0", () => {
    expect(formatSunTime(SIX_AM_UTC, 0)).toBe("6:00 AM");
  });
  it("applies positive timezone offset", () => {
    expect(formatSunTime(SIX_AM_UTC, 3600)).toBe("7:00 AM");
  });
  it("applies negative timezone offset", () => {
    expect(formatSunTime(SIX_AM_UTC, -18000)).toBe("1:00 AM");
  });
  it("handles PM times correctly", () => {
    // 1716400800 = 2024-05-22 18:00:00 UTC
    expect(formatSunTime(1716400800, 0)).toBe("6:00 PM");
  });
  it("handles 12:00 PM correctly", () => {
    expect(formatSunTime(SIX_AM_UTC + 6 * 3600, 0)).toBe("12:00 PM");
  });
  it("handles 12:00 AM correctly", () => {
    expect(formatSunTime(SIX_AM_UTC - 6 * 3600, 0)).toBe("12:00 AM");
  });
});

// ── formatHourlyTime ────────────────────────────────────────────────────────

describe("formatHourlyTime", () => {
  it("converts 00:00 to 12 AM", () => {
    expect(formatHourlyTime("00:00")).toBe("12 AM");
  });
  it("converts 06:00 to 6 AM", () => {
    expect(formatHourlyTime("06:00")).toBe("6 AM");
  });
  it("converts 12:00 to 12 PM", () => {
    expect(formatHourlyTime("12:00")).toBe("12 PM");
  });
  it("converts 15:00 to 3 PM", () => {
    expect(formatHourlyTime("15:00")).toBe("3 PM");
  });
  it("converts 21:00 to 9 PM", () => {
    expect(formatHourlyTime("21:00")).toBe("9 PM");
  });
});

// ── formatVisibility ────────────────────────────────────────────────────────

describe("formatVisibility", () => {
  it("converts 10000 meters to miles in imperial", () => {
    expect(formatVisibility(10000, "imperial")).toBe("6.2 mi");
  });
  it("converts 10000 meters to km in metric", () => {
    expect(formatVisibility(10000, "metric")).toBe("10 km");
  });
  it("handles 5000 meters in metric", () => {
    expect(formatVisibility(5000, "metric")).toBe("5 km");
  });
  it("handles 1000 meters in imperial", () => {
    expect(formatVisibility(1000, "imperial")).toBe("0.6 mi");
  });
});

// ── getDailyForecasts ───────────────────────────────────────────────────────

describe("getDailyForecasts", () => {
  const TODAY = "2024-05-22";
  const mockList = [
    // Today entries — should be excluded
    {
      dt_txt: "2024-05-22 09:00:00",
      main: { temp: 20, temp_max: 22, temp_min: 18 },
      weather: [{ id: 800 }],
    },
    {
      dt_txt: "2024-05-22 12:00:00",
      main: { temp: 25, temp_max: 26, temp_min: 20 },
      weather: [{ id: 800 }],
    },
    // Day 2
    {
      dt_txt: "2024-05-23 09:00:00",
      main: { temp: 19, temp_max: 21, temp_min: 17 },
      weather: [{ id: 500 }],
    },
    {
      dt_txt: "2024-05-23 12:00:00",
      main: { temp: 22, temp_max: 24, temp_min: 18 },
      weather: [{ id: 500 }],
    },
    {
      dt_txt: "2024-05-23 15:00:00",
      main: { temp: 21, temp_max: 22, temp_min: 19 },
      weather: [{ id: 500 }],
    },
    // Day 3 — one entry, no noon slot
    {
      dt_txt: "2024-05-24 06:00:00",
      main: { temp: 15, temp_max: 18, temp_min: 12 },
      weather: [{ id: 600 }],
    },
  ];

  it("excludes today from results", () => {
    const result = getDailyForecasts(mockList, TODAY);
    expect(result.every((d) => d.date !== TODAY)).toBe(true);
  });

  it("returns one entry per future day", () => {
    const result = getDailyForecasts(mockList, TODAY);
    expect(result).toHaveLength(2);
  });

  it("calculates high as the max temp_max across all entries for a day", () => {
    const result = getDailyForecasts(mockList, TODAY);
    const day2 = result.find((d) => d.date === "2024-05-23");
    expect(day2.high).toBe(24);
  });

  it("calculates low as the min temp_min across all entries for a day", () => {
    const result = getDailyForecasts(mockList, TODAY);
    const day2 = result.find((d) => d.date === "2024-05-23");
    expect(day2.low).toBe(17);
  });

  it("uses the noon entry icon when available", () => {
    const result = getDailyForecasts(mockList, TODAY);
    const day2 = result.find((d) => d.date === "2024-05-23");
    expect(day2.iconId).toBe(500);
  });

  it("falls back to first entry icon when no noon entry", () => {
    const result = getDailyForecasts(mockList, TODAY);
    const day3 = result.find((d) => d.date === "2024-05-24");
    expect(day3.iconId).toBe(600);
  });
});

// ── getTodayHourly ──────────────────────────────────────────────────────────

describe("getTodayHourly", () => {
  const TODAY = "2024-05-22";
  const mockList = [
    {
      dt_txt: "2024-05-22 06:00:00",
      main: { temp: 18.6 },
      weather: [{ id: 800 }],
    },
    {
      dt_txt: "2024-05-22 09:00:00",
      main: { temp: 21.4 },
      weather: [{ id: 801 }],
    },
    {
      dt_txt: "2024-05-22 12:00:00",
      main: { temp: 24.9 },
      weather: [{ id: 800 }],
    },
    {
      dt_txt: "2024-05-23 06:00:00",
      main: { temp: 17.0 },
      weather: [{ id: 500 }],
    },
  ];

  it("only returns entries from today", () => {
    const result = getTodayHourly(mockList, TODAY);
    expect(result).toHaveLength(3);
  });

  it("extracts HH:MM time string", () => {
    const result = getTodayHourly(mockList, TODAY);
    expect(result[0].time).toBe("06:00");
  });

  it("rounds temperature", () => {
    const result = getTodayHourly(mockList, TODAY);
    expect(result[0].temp).toBe(19);
    expect(result[1].temp).toBe(21);
    expect(result[2].temp).toBe(25);
  });

  it("extracts weather icon id", () => {
    const result = getTodayHourly(mockList, TODAY);
    expect(result[1].iconId).toBe(801);
  });
});

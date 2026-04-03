export interface WeatherData {
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy";
  temperature: number;
  description: string;
  icon: string;
}

/**
 * Simulate weather based on season and randomness.
 * In production, replace with OpenWeatherMap API call:
 * `https://api.openweathermap.org/data/2.5/weather?q=${city},CH&appid=${API_KEY}&units=metric`
 */
export function getSimulatedWeather(region: string): WeatherData {
  const month = new Date().getMonth();
  const seed = hashCode(region + new Date().toDateString());

  if (month >= 11 || month <= 1) {
    const conditions: WeatherData[] = [
      { condition: "snowy", temperature: -2, description: "Snowfall expected", icon: "🌨️" },
      { condition: "cloudy", temperature: 3, description: "Overcast skies", icon: "☁️" },
      { condition: "sunny", temperature: 5, description: "Clear and cold", icon: "☀️" },
    ];
    return conditions[Math.abs(seed) % conditions.length];
  }

  if (month >= 2 && month <= 4) {
    const conditions: WeatherData[] = [
      { condition: "sunny", temperature: 14, description: "Warm spring day", icon: "☀️" },
      { condition: "rainy", temperature: 10, description: "Spring showers", icon: "🌧️" },
      { condition: "cloudy", temperature: 12, description: "Partly cloudy", icon: "⛅" },
    ];
    return conditions[Math.abs(seed) % conditions.length];
  }

  if (month >= 5 && month <= 7) {
    const conditions: WeatherData[] = [
      { condition: "sunny", temperature: 26, description: "Beautiful summer day", icon: "☀️" },
      { condition: "sunny", temperature: 28, description: "Hot and sunny", icon: "🌤️" },
      { condition: "stormy", temperature: 22, description: "Afternoon thunderstorms", icon: "⛈️" },
      { condition: "cloudy", temperature: 20, description: "Warm with clouds", icon: "⛅" },
    ];
    return conditions[Math.abs(seed) % conditions.length];
  }

  const conditions: WeatherData[] = [
    { condition: "cloudy", temperature: 10, description: "Foggy morning", icon: "🌫️" },
    { condition: "rainy", temperature: 8, description: "Autumn rain", icon: "🌧️" },
    { condition: "sunny", temperature: 15, description: "Golden autumn sun", icon: "🌤️" },
  ];
  return conditions[Math.abs(seed) % conditions.length];
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

export function getWeatherRecommendation(weather: WeatherData): {
  suggestion: string;
  preferIndoor: boolean;
} {
  switch (weather.condition) {
    case "rainy":
    case "stormy":
      return {
        suggestion: "Perfect day for indoor activities — museums, spas, or escape rooms!",
        preferIndoor: true,
      };
    case "snowy":
      return {
        suggestion: "Great conditions for winter sports — skiing, snowshoeing, or sledding!",
        preferIndoor: false,
      };
    case "sunny":
      return {
        suggestion: "Beautiful weather for outdoor adventures — hiking, lakes, or mountain excursions!",
        preferIndoor: false,
      };
    case "cloudy":
      return {
        suggestion: "Good conditions for both indoor and outdoor activities.",
        preferIndoor: false,
      };
  }
}

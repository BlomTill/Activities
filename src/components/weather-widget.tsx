"use client";

import { getSimulatedWeather, getWeatherRecommendation } from "@/lib/weather";
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning } from "lucide-react";

const WEATHER_ICONS: Record<string, React.ReactNode> = {
  sunny: <Sun className="h-6 w-6 text-amber-500" />,
  cloudy: <Cloud className="h-6 w-6 text-gray-400" />,
  rainy: <CloudRain className="h-6 w-6 text-blue-500" />,
  snowy: <Snowflake className="h-6 w-6 text-blue-300" />,
  stormy: <CloudLightning className="h-6 w-6 text-purple-500" />,
};

export function WeatherWidget({ region }: { region: string }) {
  const weather = getSimulatedWeather(region);
  const recommendation = getWeatherRecommendation(weather);

  return (
    <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
      <div className="flex items-center gap-3">
        {WEATHER_ICONS[weather.condition]}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{weather.temperature}°C</span>
            <span className="text-sm text-gray-500">{weather.description}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{recommendation.suggestion}</p>
        </div>
      </div>
    </div>
  );
}

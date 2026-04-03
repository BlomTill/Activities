import { Season } from "./types";

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function getSeasonLabel(season: Season): string {
  const labels: Record<Season, string> = {
    spring: "Spring",
    summer: "Summer",
    autumn: "Autumn",
    winter: "Winter",
  };
  return labels[season];
}

export function getSeasonEmoji(season: Season): string {
  const emojis: Record<Season, string> = {
    spring: "🌸",
    summer: "☀️",
    autumn: "🍂",
    winter: "❄️",
  };
  return emojis[season];
}

export function getSeasonColors(season: Season) {
  const colors: Record<Season, { gradient: string; accent: string; bg: string }> = {
    spring: {
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    summer: {
      gradient: "from-amber-400 via-orange-500 to-red-500",
      accent: "text-orange-600",
      bg: "bg-orange-50",
    },
    autumn: {
      gradient: "from-orange-400 via-amber-600 to-yellow-700",
      accent: "text-amber-700",
      bg: "bg-amber-50",
    },
    winter: {
      gradient: "from-blue-400 via-indigo-500 to-purple-600",
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
  };
  return colors[season];
}

export function getSeasonHeroText(season: Season) {
  const texts: Record<Season, { title: string; subtitle: string }> = {
    spring: {
      title: "Spring Adventures Await",
      subtitle: "Blooming meadows, crystal lakes, and perfect hiking weather across Switzerland",
    },
    summer: {
      title: "Summer in Switzerland",
      subtitle: "From alpine lakes to thrilling adventures — make the most of the warm season",
    },
    autumn: {
      title: "Golden Autumn Experiences",
      subtitle: "Stunning foliage, wine harvests, and cozy mountain escapes",
    },
    winter: {
      title: "Winter Wonderland",
      subtitle: "World-class skiing, magical Christmas markets, and snowy alpine retreats",
    },
  };
  return texts[season];
}

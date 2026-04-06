import { TrendingInfo } from "@/lib/types";

// Trending scores and reasons for activities (by ID)
// Updated seasonally — scores from 1-100 with reason tags
export const trendingData: Record<string, TrendingInfo> = {
  "1": { score: 95, reason: "Peak season" },        // Jungfraujoch
  "4": { score: 88, reason: "Spring cruises started" }, // Lake Geneva Cruise
  "5": { score: 85, reason: "Snow activities open" },   // Titlis
  "8": { score: 92, reason: "Cherry blossoms" },        // Rhine Falls
  "10": { score: 78, reason: "Wildflower season" },     // First Grindelwald
  "13": { score: 82, reason: "Spring exhibitions" },    // Kunsthaus
  "22": { score: 90, reason: "Trails just opened" },    // Swiss National Park
  "24": { score: 87, reason: "Glacier hiking season" }, // Aletsch Glacier
  "2": { score: 80, reason: "Spring skiing" },          // Matterhorn
  "7": { score: 76, reason: "Easter specials" },        // Château de Chillon
  "144": { score: 84, reason: "Crystal-clear spring water" }, // Blausee
  "9": { score: 73, reason: "Cheese-making season" },   // Gruyères
};

export function getTrendingActivityIds(): string[] {
  return Object.entries(trendingData)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([id]) => id);
}

export function getTrendingInfo(activityId: string): TrendingInfo | undefined {
  return trendingData[activityId];
}

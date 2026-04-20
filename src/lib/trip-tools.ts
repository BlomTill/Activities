import { AgeGroup, Activity, Provider } from "./types";

export interface TripProfile {
  id: string;
  title: string;
  summary: string;
  days: number;
  budget: number;
  seasonMode: "current" | "all";
  href: string;
}

export interface ProviderRecommendation {
  provider: Provider;
  label: string;
  reason: string;
}

export const TRIP_PROFILES: TripProfile[] = [
  {
    id: "first-weekend",
    title: "First Weekend in Switzerland",
    summary: "Start with iconic highlights, easy logistics, and a realistic starter budget.",
    days: 2,
    budget: 120,
    seasonMode: "current",
    href: "/planner?days=2&budget=120&season=current",
  },
  {
    id: "student-value",
    title: "Student Value Trip",
    summary: "Find affordable experiences, free walks, and budget-friendly day plans.",
    days: 3,
    budget: 50,
    seasonMode: "current",
    href: "/budget?budget=50&ageGroup=student&season=current",
  },
  {
    id: "scenic-rail-week",
    title: "Scenic Rail Week",
    summary: "Mix major train days with flexible sightseeing and pass recommendations.",
    days: 7,
    budget: 160,
    seasonMode: "all",
    href: "/travel-passes?tripDays=7&travelDays=5",
  },
];

export function getPlannerDefaults(searchParams: URLSearchParams) {
  const requestedDays = Number(searchParams.get("days") || "3");
  const budget = Number(searchParams.get("budget") || "0");
  const tripDays = Number.isFinite(requestedDays)
    ? Math.max(1, Math.min(14, requestedDays))
    : 3;

  return {
    tripDays,
    budget: Number.isFinite(budget) ? Math.max(0, budget) : 0,
    seasonMode: searchParams.get("season") === "current" ? "current" : "all",
    ageGroup: searchParams.get("ageGroup") || "",
    activitySlug: searchParams.get("activity") || "",
    plan: searchParams.get("plan") || "",
  };
}

export function encodePlannerPlan(dayActivityIds: string[][]): string {
  return btoa(JSON.stringify(dayActivityIds));
}

export function decodePlannerPlan(encoded: string): string[][] {
  try {
    const decoded = JSON.parse(atob(encoded));
    if (!Array.isArray(decoded)) return [];
    return decoded.filter(Array.isArray).map((day) => day.filter((id): id is string => typeof id === "string"));
  } catch {
    return [];
  }
}

export function getRecommendedTripDays(activity: Activity): number {
  if (activity.duration.includes("6-8") || activity.duration.includes("full")) {
    return 3;
  }
  if (activity.location.region === "Bern Region" || activity.location.region === "Valais") {
    return 2;
  }
  return 1;
}

export function getPlannerBudgetHint(activity: Activity, ageGroup: AgeGroup): number {
  const basePrice = Math.max(20, Math.ceil(activity.providers[0].pricing[ageGroup]));
  return Math.ceil(basePrice * 1.8);
}

export function getProviderRecommendation(activity: Activity, ageGroup: AgeGroup): ProviderRecommendation {
  const ranked = [...activity.providers].sort((a, b) => {
    const scoreA = a.rating * 20 - a.pricing[ageGroup];
    const scoreB = b.rating * 20 - b.pricing[ageGroup];
    return scoreB - scoreA;
  });

  const recommended = ranked[0];
  const lowestPrice = Math.min(...activity.providers.map((provider) => provider.pricing[ageGroup]));
  const highestRating = Math.max(...activity.providers.map((provider) => provider.rating));

  if (recommended.pricing[ageGroup] === lowestPrice && recommended.rating === highestRating) {
    return {
      provider: recommended,
      label: "Best overall",
      reason: "Lowest price in this age group and the strongest rating in the list.",
    };
  }

  if (recommended.pricing[ageGroup] === lowestPrice) {
    return {
      provider: recommended,
      label: "Best value",
      reason: "Cheapest option available without giving up review quality.",
    };
  }

  if (recommended.rating === highestRating) {
    return {
      provider: recommended,
      label: "Top-rated pick",
      reason: "Highest rating in the list and still competitively priced.",
    };
  }

  return {
    provider: recommended,
    label: "Balanced pick",
    reason: "Solid rating-to-price balance for travelers who want fewer compromises.",
  };
}

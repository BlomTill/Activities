export type Season = "spring" | "summer" | "autumn" | "winter";
export type Category = "outdoor" | "culture" | "adventure" | "family" | "wellness";
export type AgeGroup = "child" | "student" | "adult" | "senior";

export interface ActivityPricing {
  child: number;
  student: number;
  adult: number;
  senior: number;
}

export interface Provider {
  name: string;
  pricing: ActivityPricing;
  bookingUrl: string;
  rating: number;
  description?: string;
}

export interface ActivityLocation {
  region: string;
  canton: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

export interface ActivityDeal {
  discount: number;
  label: string;
  validUntil: string;
  providerName?: string;
}

export interface Activity {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: Category;
  subcategory: string;
  location: ActivityLocation;
  seasons: Season[];
  indoor: boolean;
  providers: Provider[];
  currency: "CHF";
  duration: string;
  imageUrl: string;
  gallery?: string[];
  tags: string[];
  featured: boolean;
  deal?: ActivityDeal;
}

/** Get the best (lowest) price for an age group across all providers */
export function getBestPrice(activity: Activity, ageGroup: AgeGroup): number {
  return Math.min(...activity.providers.map((p) => p.pricing[ageGroup]));
}

/** Get the best-rated provider */
export function getBestRatedProvider(activity: Activity): Provider {
  return activity.providers.reduce((best, p) => (p.rating > best.rating ? p : best));
}

/** Get the cheapest provider for a given age group */
export function getCheapestProvider(activity: Activity, ageGroup: AgeGroup): Provider {
  return activity.providers.reduce((cheapest, p) =>
    p.pricing[ageGroup] < cheapest.pricing[ageGroup] ? p : cheapest
  );
}

/** Average rating across all providers */
export function getAverageRating(activity: Activity): number {
  const sum = activity.providers.reduce((s, p) => s + p.rating, 0);
  return Math.round((sum / activity.providers.length) * 10) / 10;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  content: string;
}

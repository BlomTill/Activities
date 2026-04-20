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

export interface ActivityHighlight {
  label: string;
  value: string;
}

export interface TrendingInfo {
  score: number;
  reason: string;
}

/** Credit line for a CC-licensed image (usually Wikimedia Commons). */
export interface ImageCredit {
  author?: string;
  license?: string;          // e.g. "CC BY-SA 4.0"
  sourceUrl?: string;         // link to original source page
  filename?: string;          // underlying Commons filename if applicable
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
  /**
   * Legacy / fallback image. Kept for backwards compat.
   * The new resolver in src/lib/images.ts prefers `image` → prefetched Wikimedia
   * image → this field → category fallback, in that order.
   */
  imageUrl: string;
  /**
   * Manual curator override. If set, takes highest priority.
   * Use when you have a specific rights-cleared photo you want pinned.
   */
  image?: string;
  /** Optional credit shown under the photo. Usually auto-filled by the fetch script. */
  imageCredit?: ImageCredit;
  /**
   * Wikipedia article title (English) for this activity. When set, running
   *   npm run fetch-images
   * will populate src/data/activity-images.json with a real CC photo + credit.
   * Leave empty to opt out of auto-fetching.
   */
  wikipediaTitle?: string;
  gallery?: string[];
  highlights?: ActivityHighlight[];
  tags: string[];
  featured: boolean;
  deal?: ActivityDeal;
  trending?: TrendingInfo;
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

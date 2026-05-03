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

/**
 * A marketplace/aggregator listing (SwissActivities, GetYourGuide, Viator, …)
 * that we link to but don't have an authoritative price for. Kept separate
 * from `Provider[]` so price comparison + "best price" CTAs only consider
 * real, priced suppliers — and never accidentally show "Free" for an
 * activity just because the marketplace pricing is unknown.
 */
export interface MarketplaceListing {
  /** Stable id from src/data/affiliate-partners.ts (e.g. "swissactivities"). */
  partnerId: string;
  /** Display name. Mirrors `AffiliatePartner.name`, kept here for SSR convenience. */
  partnerName: string;
  /** Direct activity page when known, or a Switzerland-scoped search URL. */
  bookingUrl: string;
  /** True when bookingUrl deep-links to the specific activity, not a search results page. */
  isDirectLink: boolean;
  /** Optional aggregate rating — not used for price comparison. */
  rating?: number;
  /** Optional human description shown next to the marketplace badge. */
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
  /**
   * Marketplaces / aggregators that resell this activity (SwissActivities,
   * GetYourGuide search results, Viator, …). These are NOT part of price
   * comparison — they're shown in a separate "Also check across platforms"
   * panel on the detail page so users can cross-reference availability.
   *
   * Populated by scripts/migrate-marketplaces.mjs from the legacy
   * provider[] entries that were injected with `pricing: 0`.
   */
  marketplaces?: MarketplaceListing[];
  tags: string[];
  featured: boolean;
  deal?: ActivityDeal;
  trending?: TrendingInfo;
}

/** True when at least one priced provider exists. */
export function hasPricedProvider(activity: Activity): boolean {
  return Array.isArray(activity.providers) && activity.providers.length > 0;
}

/**
 * Lowest price for an age group across priced providers.
 * Returns `null` when the activity has no priced providers (i.e. only
 * marketplace listings) so callers can render "Price varies" instead of
 * a misleading "Free".
 */
export function getBestPrice(activity: Activity, ageGroup: AgeGroup): number | null {
  if (!hasPricedProvider(activity)) return null;
  return Math.min(...activity.providers.map((p) => p.pricing[ageGroup]));
}

/** Best-rated priced provider, or `null` if none. */
export function getBestRatedProvider(activity: Activity): Provider | null {
  if (!hasPricedProvider(activity)) return null;
  return activity.providers.reduce((best, p) => (p.rating > best.rating ? p : best));
}

/** Cheapest priced provider for an age group, or `null` if none. */
export function getCheapestProvider(activity: Activity, ageGroup: AgeGroup): Provider | null {
  if (!hasPricedProvider(activity)) return null;
  return activity.providers.reduce((cheapest, p) =>
    p.pricing[ageGroup] < cheapest.pricing[ageGroup] ? p : cheapest
  );
}

/**
 * Lowest price across all age groups for the activity. Used for sorting
 * and bucket filters where one comparable number is needed. Returns
 * `Infinity` for marketplace-only activities so they sort to the bottom
 * of price-ascending lists rather than appearing as "free".
 */
export function getMinPriceForSort(activity: Activity, ageGroup: AgeGroup): number {
  const p = getBestPrice(activity, ageGroup);
  return p === null ? Infinity : p;
}

/**
 * Display-formatted price for an activity card / row.
 *  • priced + 0 → "Free"
 *  • priced + n → "CHF n"  (with optional "from " prefix)
 *  • marketplace-only → "Check price"
 */
export function formatActivityPrice(
  activity: Activity,
  ageGroup: AgeGroup,
  options: { withFrom?: boolean } = {}
): string {
  const price = getBestPrice(activity, ageGroup);
  if (price === null) return "Check price";
  if (price === 0) return "Free";
  return options.withFrom ? `from CHF ${price}` : `CHF ${price}`;
}

/**
 * Average rating across priced providers, then marketplace listings if no
 * priced providers exist. Returns `null` if neither list has any ratings.
 */
export function getAverageRating(activity: Activity): number | null {
  const fromProviders = activity.providers
    .map((p) => p.rating)
    .filter((r): r is number => typeof r === "number" && !Number.isNaN(r));
  if (fromProviders.length > 0) {
    const sum = fromProviders.reduce((s, r) => s + r, 0);
    return Math.round((sum / fromProviders.length) * 10) / 10;
  }
  const fromMarketplaces = (activity.marketplaces ?? [])
    .map((m) => m.rating)
    .filter((r): r is number => typeof r === "number" && !Number.isNaN(r));
  if (fromMarketplaces.length > 0) {
    const sum = fromMarketplaces.reduce((s, r) => s + r, 0);
    return Math.round((sum / fromMarketplaces.length) * 10) / 10;
  }
  return null;
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

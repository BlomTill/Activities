import activityImagesData from "@/data/activity-images.json";
import swissActivitiesImagesData from "@/data/activity-images-swissactivities.json";
import type { Activity, Category, ImageCredit } from "@/lib/types";

/**
 * ──────────────────────────────────────────────────────────────────
 *  Activity image resolver
 *
 *  Each activity gets a photo that actually MATCHES it (not a generic
 *  "random Alps" shot). We resolve in this priority order:
 *
 *    1. `activity.image`                       — manual curator override
 *    2. activity-images.json                   — Wikipedia / Unsplash photos
 *                                                 (populated by `npm run fetch-images`).
 *                                                 Wikipedia hits are extremely
 *                                                 specific (a photo of THIS landmark)
 *                                                 so they outrank scraped marketing
 *                                                 thumbnails.
 *    3. activity-images-swissactivities.json   — photos scraped from
 *                                                 SwissActivities.com — used when
 *                                                 we don't have a curated photo.
 *                                                 Fuzzy matches below 0.85 are
 *                                                 dropped by the matcher to keep
 *                                                 these accurate.
 *    4. `activity.imageUrl`                    — legacy field on the activity
 *    5. category fallback                      — generic, category-appropriate photo
 *
 *  buildFallbackChain() returns all sources in priority order so the
 *  ActivityPhoto component can cascade through them client-side if any
 *  URL fails to load (404, CORS, etc.).
 *
 *  We also return optional attribution text so we can display a small
 *  "Photo: <author> · <license>" line on detail pages.
 * ──────────────────────────────────────────────────────────────────
 */

interface StoredImage {
  src: string;
  /** Which fetch source produced this image (recorded by the fetch script). */
  source?: string;
  credit?: ImageCredit;
  alt?: string;
  sourceUrl?: string;
}

type StoredMap = Record<string, StoredImage>;

const stored = (activityImagesData as { images?: StoredMap }).images ?? {};
const swissActivitiesStored = (swissActivitiesImagesData as { images?: StoredMap }).images ?? {};

/**
 * Tiny, rights-cleared category fallback. Unsplash Source with a fixed
 * query string, so each category is visually distinct but consistent.
 */
const CATEGORY_FALLBACK: Record<Category, string> = {
  outdoor: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=1000&fit=crop",
  culture: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=1000&fit=crop",
  adventure: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600&h=1000&fit=crop",
  family: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1600&h=1000&fit=crop",
  wellness: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&h=1000&fit=crop",
};

export interface ResolvedImage {
  /** The URL to render. Guaranteed non-empty. */
  src: string;
  /** Alt text (activity name by default). */
  alt: string;
  /** Credit info for display (optional). */
  credit?: ImageCredit;
  /** How the resolver found this — useful for debugging / admin UI. */
  source: "manual" | "swissactivities" | "wikipedia" | "unsplash" | "pexels" | "pixabay" | "legacy" | "category-fallback";
}

/**
 * Resolve the best available photo for an activity.
 */
export function resolveActivityImage(activity: Activity): ResolvedImage {
  // 1. Manual override
  if (activity.image) {
    return {
      src: activity.image,
      alt: activity.name,
      credit: activity.imageCredit,
      source: "manual",
    };
  }

  // 2. Pre-fetched curated photo (Wikipedia, Unsplash, Pexels, Pixabay).
  //    Wikipedia hits are extremely activity-specific (a real landmark photo)
  //    so they outrank scraped marketing thumbnails from SwissActivities.
  const prefetched = stored[activity.slug];
  if (prefetched?.src) {
    const knownSources = ["wikipedia", "unsplash", "pexels", "pixabay"] as const;
    const storedSource = knownSources.find((s) => s === prefetched.source);
    return {
      src: prefetched.src,
      alt: activity.name,
      credit: prefetched.credit ?? activity.imageCredit,
      source: storedSource ?? "wikipedia",
    };
  }

  // 3. SwissActivities scraped photo — used when we don't have a curated
  //    Wikipedia/Unsplash photo. The matcher is tuned to a 0.85 fuzzy
  //    threshold + city-mismatch guard, so these are reasonably accurate.
  const fromSwissActivities = swissActivitiesStored[activity.slug];
  if (fromSwissActivities?.src) {
    return {
      src: fromSwissActivities.src,
      alt: fromSwissActivities.alt || activity.name,
      credit: fromSwissActivities.credit ?? activity.imageCredit,
      source: "swissactivities",
    };
  }

  // 4. Legacy imageUrl field (existing data)
  if (activity.imageUrl) {
    return {
      src: activity.imageUrl,
      alt: activity.name,
      credit: activity.imageCredit,
      source: "legacy",
    };
  }

  // 5. Category fallback
  return {
    src: CATEGORY_FALLBACK[activity.category],
    alt: `${activity.category} activity in Switzerland`,
    source: "category-fallback",
  };
}

/**
 * Build the full ordered fallback chain for an activity.
 *
 * Returns every valid URL in priority order, deduplicated.
 * The ActivityPhoto component iterates through this list on each
 * image load error, so the browser always ends up showing *something*
 * relevant rather than a broken-image icon.
 *
 * Order:
 *   1. manual override (activity.image)
 *   2. pre-fetched Wikipedia image (activity-images.json)
 *   3. legacy imageUrl (activity.imageUrl)
 *   4. category fallback (guaranteed to exist)
 */
export function buildFallbackChain(activity: Activity): string[] {
  const seen = new Set<string>();
  const chain: string[] = [];

  function add(url: string | undefined) {
    if (url && !seen.has(url)) {
      seen.add(url);
      chain.push(url);
    }
  }

  add(activity.image);
  add(stored[activity.slug]?.src);
  add(swissActivitiesStored[activity.slug]?.src);
  add(activity.imageUrl);
  add(CATEGORY_FALLBACK[activity.category]);

  return chain;
}

/**
 * Build a Wikimedia Commons `Special:FilePath` URL that resolves to a
 * width-constrained thumbnail. Used by the fetch script to store compact URLs.
 */
export function buildWikimediaThumbUrl(filename: string, width = 1600): string {
  const safeName = encodeURIComponent(filename.replace(/^File:/, "").replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${safeName}?width=${width}`;
}

/**
 * Format a compact credit string suitable for an overlay.
 * e.g. "Photo: Author · CC BY-SA 4.0"
 */
export function formatCredit(credit?: ImageCredit): string | null {
  if (!credit) return null;
  const parts: string[] = [];
  if (credit.author) parts.push(credit.author);
  if (credit.license) parts.push(credit.license);
  if (parts.length === 0) return null;
  return `Photo: ${parts.join(" · ")}`;
}

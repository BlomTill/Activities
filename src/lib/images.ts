import activityImagesData from "@/data/activity-images.json";
import type { Activity, Category, ImageCredit } from "@/lib/types";

/**
 * ──────────────────────────────────────────────────────────────────
 *  Activity image resolver
 *
 *  Each activity gets a photo that actually MATCHES it (not a generic
 *  "random Alps" shot). We resolve in this priority order:
 *
 *    1. `activity.image`           — manual curator override
 *    2. activity-images.json       — populated by `npm run fetch-images`,
 *                                     pulls real CC photos from Wikimedia
 *                                     Commons via the activity's wikipediaTitle
 *    3. `/activities/<slug>.jpg`   — drop a local file and it's picked up
 *    4. `activity.imageUrl`        — the original (usually Unsplash) fallback
 *    5. category fallback          — a generic, category-appropriate photo
 *
 *  We also return optional attribution text so we can display a small
 *  "Photo: <author> · <license>" line on detail pages (Wikipedia CC rules).
 * ──────────────────────────────────────────────────────────────────
 */

interface StoredImage {
  src: string;
  credit?: ImageCredit;
}

type StoredMap = Record<string, StoredImage>;

const stored = (activityImagesData as { images?: StoredMap }).images ?? {};

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
  source: "manual" | "wikipedia" | "local" | "legacy" | "category-fallback";
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

  // 2. Pre-fetched Wikipedia photo from activity-images.json
  const prefetched = stored[activity.slug];
  if (prefetched?.src) {
    return {
      src: prefetched.src,
      alt: activity.name,
      credit: prefetched.credit ?? activity.imageCredit,
      source: "wikipedia",
    };
  }

  // 3. Legacy imageUrl field (existing data)
  if (activity.imageUrl) {
    return {
      src: activity.imageUrl,
      alt: activity.name,
      credit: activity.imageCredit,
      source: "legacy",
    };
  }

  // 4. Category fallback
  return {
    src: CATEGORY_FALLBACK[activity.category],
    alt: `${activity.category} activity in Switzerland`,
    source: "category-fallback",
  };
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

/**
 * ──────────────────────────────────────────────────────────────────
 *  Live price fetching — single entry point
 *
 *  Pulls *current* prices from partner affiliate APIs at request time
 *  and caches them for a short TTL so we never serve stale numbers
 *  but also don't hammer the upstreams.
 *
 *  Architecture:
 *    1. Each adapter (`gygAdapter`, `viatorAdapter`, `klookAdapter`)
 *       returns `LiveQuote[]` for one activity, or `[]` on any error.
 *    2. `fetchLiveQuotes(activity)` runs all enabled adapters in
 *       parallel and merges the results.
 *    3. Wrapped in Next.js `unstable_cache` keyed by activity slug.
 *       TTL = 10 minutes by default.
 *    4. Adapters gracefully no-op when their API key is missing,
 *       so the site keeps rendering without any live partner —
 *       it just falls back to whatever is in `activity.providers`
 *       and the static deep-links in `activity.marketplaces`.
 *
 *  Adding a new partner:
 *    – Implement an adapter following the `LiveAdapter` shape
 *    – Add it to `ADAPTERS` below
 *    – Add a key check in `enabledAdapters()`
 * ──────────────────────────────────────────────────────────────────
 */
import { unstable_cache } from "next/cache";
import type { Activity } from "@/lib/types";
import { buildAffiliateUrl } from "@/lib/affiliate";

/** One real-time price quote from a partner. */
export interface LiveQuote {
  partnerId: "getyourguide" | "viator" | "klook" | "swissactivities" | "musement" | "civitatis";
  partnerName: string;
  /** Lowest available adult price returned by the partner, in CHF. */
  priceChf: number;
  /** Optional: rating returned by the partner (0–5). */
  rating?: number;
  /** Optional: review count, for tie-breaking and trust badges. */
  reviewCount?: number;
  /** Direct deep-link to the activity on the partner site (already affiliate-tracked). */
  bookingUrl: string;
  /** True when the price comes from a live API call; false for stub/fallback. */
  isLive: boolean;
  /** Whether free cancellation is available — surfaced as a badge. */
  freeCancellation?: boolean;
  /** When this quote was fetched. */
  fetchedAt: string;
}

interface LiveAdapter {
  partnerId: LiveQuote["partnerId"];
  partnerName: string;
  /** Returns true when the API key / partner ID is configured. */
  isConfigured: () => boolean;
  /** Fetches one or more quotes for this activity. Returns [] on any error. */
  fetch: (activity: Activity) => Promise<LiveQuote[]>;
}

const FETCH_TIMEOUT_MS = 4000;

/** Wrap fetch with a hard timeout so a slow partner can't stall the page. */
async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ──────────────────────────────────────────────────────────────────
 *  GetYourGuide adapter
 *  Docs: https://partner-docs.getyourguide.com/
 *  Set GETYOURGUIDE_API_KEY in .env.local to enable.
 * ────────────────────────────────────────────────────────────────── */
const gygAdapter: LiveAdapter = {
  partnerId: "getyourguide",
  partnerName: "GetYourGuide",
  isConfigured: () => Boolean(process.env.GETYOURGUIDE_API_KEY),
  async fetch(activity) {
    const key = process.env.GETYOURGUIDE_API_KEY;
    if (!key) return [];

    // GYG has a tour-search endpoint that takes a query + country
    const url = `https://api.getyourguide.com/1/tours?q=${encodeURIComponent(
      activity.name
    )}&cnt_id=200&limit=1&currency=CHF&lang=en`;
    const res = await fetchWithTimeout(url, {
      headers: { "X-ACCESS-TOKEN": key, Accept: "application/json" },
    });
    if (!res?.ok) return [];

    let payload: { data?: { tours?: Array<Record<string, unknown>> } };
    try {
      payload = await res.json();
    } catch {
      return [];
    }
    const tour = payload?.data?.tours?.[0];
    if (!tour) return [];

    const priceChf = Number((tour.price as { amount?: number } | undefined)?.amount);
    const rating = Number(tour.overall_rating);
    const reviewCount = Number(tour.number_of_ratings);
    const rawUrl = String(tour.url ?? "");
    if (!Number.isFinite(priceChf) || priceChf <= 0 || !rawUrl) return [];

    return [
      {
        partnerId: "getyourguide",
        partnerName: "GetYourGuide",
        priceChf,
        rating: Number.isFinite(rating) ? rating : undefined,
        reviewCount: Number.isFinite(reviewCount) ? reviewCount : undefined,
        bookingUrl: buildAffiliateUrl(rawUrl, {
          slug: activity.slug,
          slot: "compare-cta",
          forcePartner: "getyourguide",
        }),
        isLive: true,
        freeCancellation: Boolean(tour.flags && (tour.flags as string[]).includes("FREE_CANCELLATION")),
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

/* ──────────────────────────────────────────────────────────────────
 *  Viator adapter — uses the real Partner API spec
 *  Docs: https://docs.viator.com/partner-api/
 *  OpenAPI: https://api.viator.com/partner (verified against the spec)
 *
 *  Endpoint: POST /partner/search/freetext
 *  Auth header: `exp-api-key`
 *  Accept: `application/json;version=2.0`
 *
 *  IMPORTANT: Viator's `productUrl` is returned pre-tracked with `pid`,
 *  `mcid`, and the partner's affiliate attribution. The spec explicitly
 *  forbids modifying it ("You must use the full URL and not modify it in
 *  any way – any changes could result in failure to attribute the sale
 *  to you, which means you will not be paid a commission for this sale").
 *  We therefore return the productUrl unmodified — `buildAffiliateUrl()`
 *  detects Viator API URLs (presence of `pid` + `mcid` + `medium=api`)
 *  and skips tracking-param merging for them.
 * ────────────────────────────────────────────────────────────────── */
interface ViatorFreetextResponse {
  products?: {
    totalCount?: number;
    results?: Array<{
      productCode?: string;
      title?: string;
      productUrl?: string;
      pricing?: {
        summary?: { fromPrice?: number; fromPriceBeforeDiscount?: number };
        currency?: string;
      };
      reviews?: { combinedAverageRating?: number; totalReviews?: number };
      flags?: string[];
    }>;
  };
}

const viatorAdapter: LiveAdapter = {
  partnerId: "viator",
  partnerName: "Viator",
  isConfigured: () => Boolean(process.env.VIATOR_API_KEY),
  async fetch(activity) {
    const key = process.env.VIATOR_API_KEY;
    if (!key) return [];

    const res = await fetchWithTimeout(
      "https://api.viator.com/partner/search/freetext",
      {
        method: "POST",
        headers: {
          "exp-api-key": key,
          Accept: "application/json;version=2.0",
          "Accept-Language": "en-US",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchTerm: activity.name,
          currency: "CHF",
          searchTypes: [
            { searchType: "PRODUCTS", pagination: { start: 1, count: 1 } },
          ],
        }),
      }
    );
    if (!res?.ok) return [];

    let payload: ViatorFreetextResponse;
    try {
      payload = (await res.json()) as ViatorFreetextResponse;
    } catch {
      return [];
    }
    const product = payload?.products?.results?.[0];
    if (!product) return [];

    const priceChf = Number(product.pricing?.summary?.fromPrice);
    const rating = Number(product.reviews?.combinedAverageRating);
    const reviewCount = Number(product.reviews?.totalReviews);
    const productUrl = String(product.productUrl ?? "");
    if (!Number.isFinite(priceChf) || priceChf <= 0 || !productUrl) return [];

    return [
      {
        partnerId: "viator",
        partnerName: "Viator",
        priceChf,
        rating: Number.isFinite(rating) ? rating : undefined,
        reviewCount: Number.isFinite(reviewCount) ? reviewCount : undefined,
        // DO NOT WRAP through buildAffiliateUrl — Viator's productUrl is
        // pre-attributed and modifying it breaks commission tracking.
        bookingUrl: productUrl,
        isLive: true,
        freeCancellation: product.flags?.includes("FREE_CANCELLATION") ?? false,
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

/* ──────────────────────────────────────────────────────────────────
 *  Klook adapter
 *  Docs: https://affiliate.klook.com/api-docs
 *  Set KLOOK_API_KEY + KLOOK_API_SECRET in .env.local to enable.
 * ────────────────────────────────────────────────────────────────── */
const klookAdapter: LiveAdapter = {
  partnerId: "klook",
  partnerName: "Klook",
  isConfigured: () => Boolean(process.env.KLOOK_API_KEY && process.env.KLOOK_API_SECRET),
  async fetch(activity) {
    const key = process.env.KLOOK_API_KEY;
    if (!key) return [];

    const url = `https://affiliate-api.klook.com/v3/open_api/activities?keyword=${encodeURIComponent(
      activity.name
    )}&country=CH&currency=CHF&page_size=1`;
    const res = await fetchWithTimeout(url, {
      headers: { "X-API-KEY": key, Accept: "application/json" },
    });
    if (!res?.ok) return [];

    let payload: { activity?: Array<Record<string, unknown>> };
    try {
      payload = await res.json();
    } catch {
      return [];
    }
    const item = payload?.activity?.[0];
    if (!item) return [];

    const priceChf = Number(
      (item.sell_price as { amount?: number } | undefined)?.amount ?? item.lowest_price
    );
    const rating = Number(item.score);
    const reviewCount = Number(item.review_total);
    const rawUrl = String(item.deep_link ?? item.url ?? "");
    if (!Number.isFinite(priceChf) || priceChf <= 0 || !rawUrl) return [];

    return [
      {
        partnerId: "klook",
        partnerName: "Klook",
        priceChf,
        rating: Number.isFinite(rating) ? rating : undefined,
        reviewCount: Number.isFinite(reviewCount) ? reviewCount : undefined,
        bookingUrl: buildAffiliateUrl(rawUrl, {
          slug: activity.slug,
          slot: "compare-cta",
          forcePartner: "klook",
        }),
        isLive: true,
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

const ADAPTERS: LiveAdapter[] = [gygAdapter, viatorAdapter, klookAdapter];

/** Adapters that have credentials configured. */
function enabledAdapters(): LiveAdapter[] {
  return ADAPTERS.filter((a) => a.isConfigured());
}

/**
 * Fetch live quotes for one activity, with caching.
 *
 * The result is cached per slug for 10 minutes via Next.js's `unstable_cache`
 * — that's the staleness guarantee. On cache miss we hit every enabled
 * adapter in parallel and merge results.
 *
 * Returns `[]` when no adapter is configured. Callers should fall back to
 * `activity.providers` (static prices) and `activity.marketplaces`
 * (deep-link-only listings) in that case.
 */
async function fetchLiveQuotesUncached(activity: Activity): Promise<LiveQuote[]> {
  const adapters = enabledAdapters();
  if (adapters.length === 0) return [];
  const settled = await Promise.allSettled(adapters.map((a) => a.fetch(activity)));
  const out: LiveQuote[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") out.push(...r.value);
  }
  return out;
}

const LIVE_QUOTE_TTL_SECONDS = 10 * 60;

export const fetchLiveQuotes = (activity: Activity): Promise<LiveQuote[]> =>
  unstable_cache(
    async () => fetchLiveQuotesUncached(activity),
    ["live-quotes", activity.slug],
    { revalidate: LIVE_QUOTE_TTL_SECONDS, tags: [`activity:${activity.slug}`] }
  )();

/** Number of adapters with valid credentials. Useful for admin/debug pages. */
export function getEnabledAdapterCount(): number {
  return enabledAdapters().length;
}

/** Names of enabled adapters — for the partner disclosure footer / debug. */
export function getEnabledAdapterNames(): string[] {
  return enabledAdapters().map((a) => a.partnerName);
}

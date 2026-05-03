import {
  AFFILIATE_PARTNERS,
  findPartnerByUrl,
  getPartner,
  type AffiliatePartner,
  type AffiliateSlot,
} from "@/data/affiliate-partners";
import type { Activity, MarketplaceListing } from "@/lib/types";

export type { AffiliatePartner, AffiliateSlot };

/**
 * ──────────────────────────────────────────────────────────────────
 *  Affiliate helper — single entry point for every affiliate URL
 *
 *  Responsibilities:
 *    1. Append the right tracking parameters based on the destination URL
 *    2. Tag every outbound click with a slot label for GA4 attribution
 *    3. Build Switzerland-scoped marketplace search URLs from a partner's
 *       `searchUrlTemplate` when we don't have a direct activity URL
 *    4. Merge per-activity `Activity.marketplaces[]` (deep links populated
 *       by scripts/migrate-marketplaces.mjs) with template-based search
 *       URLs so the "Also check across platforms" panel always shows
 *       the most specific available URL for each partner
 *    5. Produce a GA4 / dataLayer event helper for clicks
 * ──────────────────────────────────────────────────────────────────
 */

interface BuildOptions {
  /** Activity slug (so we can attribute which page drove the click). */
  slug?: string;
  /** Location in the page, e.g. "activity-detail-cta". */
  slot?: AffiliateSlot;
  /** Optional override — force a specific partner id. */
  forcePartner?: string;
}

/** Append tracking params + our own slot/slug label to the URL. */
export function buildAffiliateUrl(bookingUrl: string, opts: BuildOptions = {}): string {
  let partner: AffiliatePartner | undefined;
  if (opts.forcePartner) partner = getPartner(opts.forcePartner);
  if (!partner) partner = findPartnerByUrl(bookingUrl);

  try {
    const url = new URL(bookingUrl);

    if (partner) {
      const extras = new URLSearchParams(partner.trackingParams);
      extras.forEach((v, k) => {
        if (!url.searchParams.has(k)) url.searchParams.set(k, v);
      });
    }

    if (opts.slot) url.searchParams.set("es_slot", opts.slot);
    if (opts.slug) url.searchParams.set("es_slug", opts.slug);

    return url.toString();
  } catch {
    return bookingUrl;
  }
}

/** Legacy signature kept for backwards compatibility. */
export function getAffiliateUrl(bookingUrl: string): string {
  return buildAffiliateUrl(bookingUrl);
}

type DataLayerWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Fire a GA4 / dataLayer event for an affiliate click.
 * Safe to call from anywhere — no-op on the server.
 */
export function trackAffiliateClick(
  bookingUrl: string,
  opts: BuildOptions & { providerName?: string; priceChf?: number } = {}
) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  const partner = findPartnerByUrl(bookingUrl);
  const payload = {
    event: "affiliate_click",
    partner: partner?.id ?? "unknown",
    partner_name: partner?.name ?? "unknown",
    slot: opts.slot ?? "other",
    slug: opts.slug,
    provider: opts.providerName,
    price_chf: opts.priceChf,
    value: opts.priceChf,
    currency: "CHF",
  };

  if (typeof w.gtag === "function") {
    w.gtag("event", "affiliate_click", payload);
  }
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
}

/** All active partners (for rendering on /partners disclosure page). */
export function getActivePartners(): AffiliatePartner[] {
  return AFFILIATE_PARTNERS.filter((p) => p.active);
}

/** Suggested `rel` attribute for every affiliate link — SEO + FTC compliance. */
export const AFFILIATE_REL = "sponsored noopener nofollow";

/* ──────────────────────────────────────────────────────────────────
 *  Marketplace search-link builder
 *
 *  For partners that don't have per-activity booking URLs, this builds
 *  Switzerland-scoped search URLs using each partner's
 *  `searchUrlTemplate`, then layers affiliate tracking on top.
 * ────────────────────────────────────────────────────────────────── */

export interface MarketplaceLink {
  partner: AffiliatePartner;
  url: string;
  label: string;
  /** True when the URL deep-links to a specific activity (vs a search results page). */
  isDirectLink: boolean;
}

/**
 * Convert a city name to a URL-friendly slug.
 * e.g. "St. Moritz" → "st-moritz", "Zürich" → "zurich"
 */
function toCitySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Fill template placeholders with activity-specific values. */
function fillTemplate(template: string, activity: Activity): string {
  return template
    .replace("{name}", encodeURIComponent(activity.name))
    .replace("{city}", encodeURIComponent(activity.location.city))
    .replace("{citySlug}", toCitySlug(activity.location.city))
    .replace("{canton}", encodeURIComponent(activity.location.canton));
}

/**
 * For one MarketplaceListing on an activity, build the final tracked URL.
 * Already includes the partner ref param if it was present on the
 * scraped URL; we layer es_slot/es_slug on top via buildAffiliateUrl.
 */
function urlFromListing(
  listing: MarketplaceListing,
  activity: Activity,
  slot: AffiliateSlot
): string {
  return buildAffiliateUrl(listing.bookingUrl, { slug: activity.slug, slot });
}

/** Build a marketplace search URL for a partner that has no direct listing. */
function searchUrlFor(
  partner: AffiliatePartner,
  activity: Activity,
  slot: AffiliateSlot
): string | null {
  if (!partner.searchUrlTemplate) return null;
  const filled = fillTemplate(partner.searchUrlTemplate, activity);
  return buildAffiliateUrl(filled, { slug: activity.slug, slot, forcePartner: partner.id });
}

/**
 * Return marketplace links for every active partner that's worth showing
 * for this activity. For each partner we prefer:
 *   1. A direct listing from `activity.marketplaces[]` (deep link)
 *   2. The partner's searchUrlTemplate filled with the activity's name/city
 *   3. (If neither is available, the partner is skipped.)
 *
 * Sorted: direct links first, then alphabetical by partner name.
 */
export function getMarketplaceLinks(
  activity: Activity,
  slot: AffiliateSlot = "activity-detail-provider"
): MarketplaceLink[] {
  const directByPartner = new Map<string, MarketplaceListing>();
  for (const m of activity.marketplaces ?? []) {
    if (!directByPartner.has(m.partnerId)) directByPartner.set(m.partnerId, m);
  }

  const links: MarketplaceLink[] = [];

  for (const partner of AFFILIATE_PARTNERS) {
    if (!partner.active) continue;
    const direct = directByPartner.get(partner.id);
    if (direct) {
      links.push({
        partner,
        url: urlFromListing(direct, activity, slot),
        label: direct.isDirectLink
          ? `Open on ${partner.name}`
          : `Search on ${partner.name}`,
        isDirectLink: direct.isDirectLink,
      });
      continue;
    }
    if (partner.showInMarketplace && partner.searchUrlTemplate) {
      const url = searchUrlFor(partner, activity, slot);
      if (!url) continue;
      links.push({
        partner,
        url,
        label: `Search on ${partner.name}`,
        isDirectLink: false,
      });
    }
  }

  // Direct deep links first, then alphabetical
  return links.sort((a, b) => {
    if (a.isDirectLink !== b.isDirectLink) return a.isDirectLink ? -1 : 1;
    return a.partner.name.localeCompare(b.partner.name);
  });
}

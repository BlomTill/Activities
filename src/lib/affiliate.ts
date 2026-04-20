import {
  AFFILIATE_PARTNERS,
  findPartnerByUrl,
  getPartner,
  type AffiliatePartner,
  type AffiliateSlot,
} from "@/data/affiliate-partners";

export type { AffiliatePartner, AffiliateSlot };

/**
 * ──────────────────────────────────────────────────────────────────
 *  Affiliate helper
 *
 *  Responsibilities:
 *    1. Append the right tracking parameters based on the destination URL
 *    2. Tag every outbound click with a slot label for GA4 attribution
 *    3. Produce both a URL (for server-rendered anchors) and an onClick
 *       handler that fires a GA4 / dataLayer event (for client components)
 *
 *  The backward-compatible `getAffiliateUrl()` is still exported so
 *  existing call sites keep working while we migrate.
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

    // Partner-specific tracking
    if (partner) {
      const extras = new URLSearchParams(partner.trackingParams);
      extras.forEach((v, k) => {
        if (!url.searchParams.has(k)) url.searchParams.set(k, v);
      });
    }

    // Our own attribution so we can cross-reference with GA4
    if (opts.slot) url.searchParams.set("es_slot", opts.slot);
    if (opts.slug) url.searchParams.set("es_slug", opts.slug);

    return url.toString();
  } catch {
    return bookingUrl;
  }
}

/** Legacy signature kept so old call sites don't break. */
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

  // GA4 via gtag
  if (typeof w.gtag === "function") {
    w.gtag("event", "affiliate_click", payload);
  }
  // Fallback to raw dataLayer for GTM
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
}

/** All active partners (for rendering on /partners disclosure page). */
export function getActivePartners(): AffiliatePartner[] {
  return AFFILIATE_PARTNERS.filter((p) => p.active);
}

/** Suggested `rel` attribute for every affiliate link — SEO + FTC compliance. */
export const AFFILIATE_REL = "sponsored noopener nofollow";

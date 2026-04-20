/**
 * ──────────────────────────────────────────────────────────────────
 *  Affiliate partner registry
 *
 *  Central source of truth for every booking partner we earn
 *  commission on. Editing this file is enough to:
 *    – update the payout %
 *    – change the tracking parameter
 *    – toggle a partner off (set `active: false`)
 *    – add a new partner
 *
 *  Tracking IDs are placeholders (fill them in via .env in production
 *  so we don't commit real secrets).
 * ──────────────────────────────────────────────────────────────────
 */
export type AffiliateSlot =
  | "activity-detail-cta" // big green "Book now" on /activities/[slug]
  | "activity-detail-provider" // smaller per-provider links
  | "compare-cta" // CTA in the comparison table
  | "deal-card" // "Deals" page
  | "story-inline" // inline links inside editorial stories
  | "newsletter"
  | "other";

export interface AffiliatePartner {
  /** Stable short id, e.g. "getyourguide". Used in tracking URLs. */
  id: string;
  /** Display name shown in UI/disclosures. */
  name: string;
  /** Domains we recognise this partner on (for automatic detection). */
  domains: string[];
  /** Query parameter string to append. Gets prefixed with ? or &. */
  trackingParams: string;
  /** Approximate commission rate (used for admin/forecasting only). */
  commissionRate: string;
  /** Whether to actively inject tracking params. */
  active: boolean;
  /** Short note shown on /partners disclosure page. */
  disclosure: string;
  /** Marketing category for grouping on /partners. */
  tier: "primary" | "secondary" | "niche";
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "getyourguide",
    name: "GetYourGuide",
    domains: ["getyourguide.com", "getyourguide.ch"],
    trackingParams: "partner_id=XXXXXXX&utm_medium=online_publisher&utm_source=exploreswitzerland",
    commissionRate: "8%",
    active: true,
    disclosure:
      "Europe's largest tours & activities marketplace. Commission is paid by GetYourGuide, not added to the price you pay.",
    tier: "primary",
  },
  {
    id: "viator",
    name: "Viator",
    domains: ["viator.com"],
    trackingParams: "pid=P00XXXXX&mcid=42383&medium=link",
    commissionRate: "8%",
    active: true,
    disclosure:
      "Viator (a TripAdvisor company) covers many of the same activities. We show whichever partner has better availability or price at the time.",
    tier: "primary",
  },
  {
    id: "booking",
    name: "Booking.com",
    domains: ["booking.com"],
    trackingParams: "aid=XXXXXXX&label=exploreswitzerland",
    commissionRate: "25% of Booking.com's profit",
    active: true,
    disclosure:
      "Accommodation links go through Booking.com. You pay the same price either way; we earn a small share of Booking's profit.",
    tier: "primary",
  },
  {
    id: "klook",
    name: "Klook",
    domains: ["klook.com"],
    trackingParams: "aid=XXXXX&aff_platform=online_publisher",
    commissionRate: "5%",
    active: true,
    disclosure:
      "Popular for travellers coming from Asia — often has exclusive deals on rail passes and ski passes.",
    tier: "primary",
  },
  {
    id: "omio",
    name: "Omio",
    domains: ["omio.com"],
    trackingParams: "partner_id=exploreswitzerland",
    commissionRate: "2-6%",
    active: true,
    disclosure:
      "For train, bus, and transfer bookings within Europe. We display Omio alongside the official SBB for comparison.",
    tier: "secondary",
  },
  {
    id: "swissactivities",
    name: "SwissActivities",
    domains: ["swissactivities.com"],
    trackingParams: "tap_a=XXXXX&utm_source=exploreswitzerland",
    commissionRate: "10%",
    active: true,
    disclosure:
      "A Swiss-focused activity marketplace with a curated catalogue of day trips and excursions.",
    tier: "secondary",
  },
  {
    id: "rentalcars",
    name: "Rentalcars.com",
    domains: ["rentalcars.com"],
    trackingParams: "affiliateCode=exploreswitzerland",
    commissionRate: "6-10%",
    active: true,
    disclosure:
      "Car hire for mountain passes and off-the-rail itineraries. Powered by Booking Holdings.",
    tier: "niche",
  },
  {
    id: "swisspass",
    name: "Swiss Travel Pass (Interrail)",
    domains: ["interrail.eu", "eurail.com"],
    trackingParams: "partner_id=exploreswitzerland",
    commissionRate: "5%",
    active: true,
    disclosure:
      "Official re-seller of the Swiss Travel Pass. Commission helps us keep the rail-tips content free.",
    tier: "niche",
  },
];

const BY_DOMAIN: Record<string, AffiliatePartner> = {};
for (const p of AFFILIATE_PARTNERS) {
  if (!p.active) continue;
  for (const d of p.domains) BY_DOMAIN[d] = p;
}

/** Look up a partner by booking URL hostname. Returns undefined if unknown. */
export function findPartnerByUrl(bookingUrl: string): AffiliatePartner | undefined {
  try {
    const host = new URL(bookingUrl).hostname.toLowerCase();
    for (const d of Object.keys(BY_DOMAIN)) {
      if (host === d || host.endsWith("." + d)) return BY_DOMAIN[d];
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

/** Get partner by id, regardless of active state. */
export function getPartner(id: string): AffiliatePartner | undefined {
  return AFFILIATE_PARTNERS.find((p) => p.id === id);
}

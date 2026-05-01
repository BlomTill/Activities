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
  /**
   * URL template for a Switzerland-scoped activity search on this platform.
   * Supports the following placeholders:
   *   {name}     → URL-encoded activity name (e.g. "Jungfraujoch")
   *   {city}     → URL-encoded city           (e.g. "Interlaken")
   *   {citySlug} → kebab-case city             (e.g. "interlaken")
   *   {canton}   → canton abbreviation         (e.g. "BE")
   * Leave undefined for partners where search URLs don't apply
   * (e.g. Booking.com accommodation links).
   */
  searchUrlTemplate?: string;
  /**
   * When true, the marketplace comparison panel will include this partner
   * (only shown if searchUrlTemplate is also set).
   */
  showInMarketplace?: boolean;
}

function trackingFromEnv(envKey: string, devFallback: string): string {
  const value = process.env[envKey]?.trim();
  if (value) return value;
  return process.env.NODE_ENV === "production" ? "" : devFallback;
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "getyourguide",
    name: "GetYourGuide",
    domains: ["getyourguide.com", "getyourguide.ch"],
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_GETYOURGUIDE_PARAMS",
      "partner_id=XXXXXXX&utm_medium=online_publisher&utm_source=realswitzerland"
    ),
    commissionRate: "8%",
    active: true,
    disclosure:
      "Europe's largest tours & activities marketplace. Commission is paid by GetYourGuide, not added to the price you pay.",
    tier: "primary",
    // Switzerland: country_id=200, city-specific searches work via /s/?q=
    searchUrlTemplate: "https://www.getyourguide.com/s/?q={name}&country_id=200",
    showInMarketplace: true,
  },
  {
    id: "viator",
    name: "Viator",
    domains: ["viator.com"],
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_VIATOR_PARAMS",
      "pid=P00XXXXX&mcid=42383&medium=link"
    ),
    commissionRate: "8%",
    active: true,
    disclosure:
      "Viator (a TripAdvisor company) covers many of the same activities. We show whichever partner has better availability or price at the time.",
    tier: "primary",
    // Viator Switzerland search — geo=302860 is Switzerland's destination ID
    searchUrlTemplate: "https://www.viator.com/search/{name}?geo=302860",
    showInMarketplace: true,
  },
  {
    id: "booking",
    name: "Booking.com",
    domains: ["booking.com"],
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_BOOKING_PARAMS",
      "aid=XXXXXXX&label=realswitzerland"
    ),
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
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_KLOOK_PARAMS",
      "aid=XXXXX&aff_platform=online_publisher"
    ),
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
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_OMIO_PARAMS",
      "partner_id=realswitzerland"
    ),
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
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_SWISSACTIVITIES_PARAMS",
      // Real affiliate ref — program: "Swiss Activities Affiliate Program English"
      // Commission tiers: 5% (high), 3% (standard), 1% (low), 0% (standard/free)
      "ref=odbhodn"
    ),
    commissionRate: "3–5%",
    active: true,
    disclosure:
      "Switzerland's largest leisure activities marketplace. Commission (3–5%) is paid by SwissActivities, not added to the price you pay.",
    tier: "primary",
    // Deep link format (discovered from real link):
    //   https://www.swissactivities.com/en-ch/{venue-slug}/{ticket-slug}/?ref=odbhodn
    // Append ?ref=odbhodn to ANY swissactivities.com page URL — no generator needed.
    searchUrlTemplate: "https://www.swissactivities.com/en-ch/activities/?q={name}&ref=odbhodn",
    showInMarketplace: true,
  },
  {
    id: "rentalcars",
    name: "Rentalcars.com",
    domains: ["rentalcars.com"],
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_RENTALCARS_PARAMS",
      "affiliateCode=realswitzerland"
    ),
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
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_SWISSPASS_PARAMS",
      "partner_id=realswitzerland"
    ),
    commissionRate: "5%",
    active: true,
    disclosure:
      "Official re-seller of the Swiss Travel Pass. Commission helps us keep the rail-tips content free.",
    tier: "niche",
  },
  {
    id: "musement",
    name: "Musement",
    domains: ["musement.com"],
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_MUSEMENT_PARAMS",
      // Replace XXXXXXX with your Travelpayouts or direct Musement affiliate ID
      "utm_source=realswitzerland&utm_medium=affiliate&utm_campaign=XXXXXXX"
    ),
    commissionRate: "5–6% (or 50% margin share via Travelpayouts)",
    active: true,
    disclosure:
      "Musement (TUI Group) covers cultural experiences across Switzerland — particularly strong on museum entries, CERN, and historical sites. Commission is paid by Musement, not added to your price.",
    tier: "secondary",
    // Musement Switzerland city pages follow /en/{city-slug}/ pattern
    searchUrlTemplate: "https://www.musement.com/en/{citySlug}/",
    showInMarketplace: true,
  },
  {
    id: "civitatis",
    name: "Civitatis",
    domains: ["civitatis.com"],
    trackingParams: trackingFromEnv(
      "NEXT_PUBLIC_AFFILIATE_CIVITATIS_PARAMS",
      // Replace with your Civitatis affiliate ID (from civitatis.com/en/affiliates/)
      "aid=XXXXXXX&utm_source=realswitzerland"
    ),
    commissionRate: "8–10% (free tours earn €1/person aged 12+)",
    active: true,
    disclosure:
      "Civitatis specialises in guided tours and free walking tours across European cities. Pays commission even on free tours (€1 per participant). No intermediary — commission paid directly.",
    tier: "secondary",
    // Civitatis Switzerland pages: /en/{city-slug}/
    searchUrlTemplate: "https://www.civitatis.com/en/{citySlug}/",
    showInMarketplace: true,
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

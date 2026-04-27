/**
 * ──────────────────────────────────────────────────────────────────
 *  Marketplace search-link builder
 *
 *  For partners that don't have per-activity booking URLs in our DB,
 *  this module builds Switzerland-scoped search URLs using each
 *  partner's `searchUrlTemplate`, then appends affiliate tracking.
 *
 *  Usage:
 *    const links = getMarketplaceLinks(activity);
 *    // → [{ partner, url, label }, …]  — one per showInMarketplace partner
 * ──────────────────────────────────────────────────────────────────
 */

import { AFFILIATE_PARTNERS, type AffiliatePartner } from "@/data/affiliate-partners";
import type { Activity } from "@/lib/types";

export interface MarketplaceLink {
  partner: AffiliatePartner;
  /** Final URL with Switzerland scope + affiliate tracking params. */
  url: string;
  /** Short human-readable label, e.g. "Search on GetYourGuide" */
  label: string;
}

/**
 * Convert a city name to a URL-friendly slug.
 * e.g. "St. Moritz" → "st-moritz", "Zürich" → "zurich"
 */
function toCitySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics: ü→u, ä→a, ö→o
    .replace(/[^a-z0-9]+/g, "-")     // non-alphanum → hyphen
    .replace(/^-|-$/g, "");          // trim leading/trailing hyphens
}

/**
 * Fill template placeholders with activity-specific values.
 *
 *  {name}     → URL-encoded activity name
 *  {city}     → URL-encoded city name (original casing)
 *  {citySlug} → kebab-case, ASCII city slug
 *  {canton}   → canton abbreviation (e.g. "BE")
 */
function fillTemplate(template: string, activity: Activity): string {
  return template
    .replace("{name}", encodeURIComponent(activity.name))
    .replace("{city}", encodeURIComponent(activity.location.city))
    .replace("{citySlug}", toCitySlug(activity.location.city))
    .replace("{canton}", encodeURIComponent(activity.location.canton));
}

/**
 * Append a partner's tracking params to a base URL string.
 * Safely handles existing query strings and skips blank param strings.
 */
function appendTracking(baseUrl: string, trackingParams: string): string {
  if (!trackingParams.trim()) return baseUrl;
  try {
    const url = new URL(baseUrl);
    const extras = new URLSearchParams(trackingParams);
    extras.forEach((value, key) => {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    // If URL parsing fails just glue the params on
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}${trackingParams}`;
  }
}

/**
 * Return marketplace search links for all active partners that have
 * `showInMarketplace: true` and a `searchUrlTemplate`.
 *
 * The resulting URLs are:
 *   1. Built from the partner's searchUrlTemplate (Switzerland-scoped)
 *   2. Supplemented with affiliate tracking params
 *   3. Tagged with our own `es_slug` attribution param
 */
export function getMarketplaceLinks(activity: Activity): MarketplaceLink[] {
  return AFFILIATE_PARTNERS
    .filter((p) => p.active && p.showInMarketplace && p.searchUrlTemplate)
    .map((partner) => {
      const filled = fillTemplate(partner.searchUrlTemplate!, activity);
      const tracked = appendTracking(filled, partner.trackingParams);

      // Add our own attribution so GA4 can attribute this click
      let finalUrl = tracked;
      try {
        const url = new URL(tracked);
        url.searchParams.set("es_slug", activity.slug);
        url.searchParams.set("es_src", "marketplace_panel");
        finalUrl = url.toString();
      } catch {
        /* ignore */
      }

      return {
        partner,
        url: finalUrl,
        label: `Search on ${partner.name}`,
      };
    });
}

/**
 * Same as getMarketplaceLinks but returns only partners whose
 * searchUrlTemplate produces a city-level URL (i.e., uses {citySlug}).
 * Useful when we want to show "Browse all activities in Interlaken on X".
 */
export function getMarketplaceCityLinks(activity: Activity): MarketplaceLink[] {
  return getMarketplaceLinks(activity).filter(
    (l) => l.partner.searchUrlTemplate?.includes("{citySlug}")
  );
}

/**
 * Same as getMarketplaceLinks but returns only partners whose
 * searchUrlTemplate uses {name} — i.e., a direct keyword search.
 * Useful for a "Find this exact activity on X" CTA.
 */
export function getMarketplaceNameLinks(activity: Activity): MarketplaceLink[] {
  return getMarketplaceLinks(activity).filter(
    (l) => l.partner.searchUrlTemplate?.includes("{name}")
  );
}

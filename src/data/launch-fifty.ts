/**
 * ──────────────────────────────────────────────────────────────────
 *  Launch top-50 (a.k.a. the "publish allow-list")
 *
 *  These slugs are the only activities that ship to production at launch.
 *  Everything else in `content/activities/` is set to `published: false`
 *  by `scripts/content-check.mjs --apply` so it's quarantined out of
 *  index pages, search, and the sitemap until it meets the quality bar.
 *
 *  Selection criteria — every entry must have, or be queued for:
 *    • ≥2 booking partners (live API + static fallback)
 *    • A verified hero image that depicts the actual feature
 *    • Hand-edited description (not the auto-generated "Discover X")
 *
 *  Priority logic for picking these 50:
 *    1. High Google search volume in EN/DE/FR for Switzerland tourism
 *    2. Bookable (vs. free hike with no ticket → no commission)
 *    3. Wide affiliate coverage (GYG + Viator + SwissActivities all list it)
 *    4. Geographic spread (so we cover all major regions, not just BE)
 *
 *  Edit this list freely — it's the single source of truth for what
 *  goes live. Keep it under ~60 entries; depth beats breadth.
 * ────────────────────────────────────────────────────────────────── */

export const LAUNCH_FIFTY_SLUGS: readonly string[] = [
  // ── Iconic peak excursions (highest commercial intent)
  "jungfraujoch-top-of-europe",
  "schilthorn-piz-gloria",
  "harder-kulm-interlaken",
  "pilatus-golden-round-trip",
  "rigi-queen-of-mountains",
  "titlis-glacier-excursion",
  "ticket-firstbahn-to-grindelwald-first-top-of-adventure",
  "grindelwald-first-cliff-walk",
  "aletsch-glacier-hike",

  // ── Scenic trains & passes (huge SEO volume)
  "glacier-express",
  "bernina-express",
  "swiss-travel-pass-en",
  "swiss-travel-pass-flex-en",
  "matterhorn-gotthard-pass",

  // ── Famous lakes & waterfalls
  "rhine-falls-schaffhausen",
  "lake-geneva-boat-cruise",
  "lake-lucerne-paddle-steamer",
  "lake-thun-full-day-tour-from-interlaken",
  "trummelbach-falls",
  "oeschinensee-circular-hike",
  "bachalpsee-hike",

  // ── Castles & culture
  "chateau-de-chillon",
  "cern-visit",
  "zurich-old-town-stroll-boat-trip",
  "bern-old-town-walking-tour",
  "rhine-falls-and-stein-am-rhein-tour-from-zurich",

  // ── Adventure (high ticket value, strong commission)
  "interlaken-paragliding",
  "matterhorn-paragliding-zermatt",
  "lauterbrunnen-valley-paragliding-tandem-flight-from-lauterbrunnen",
  "canyoning-interlaken",
  "canyon-swing-grindelwald-glacier-gorge",
  "adventure-park-interlaken",
  "lauterbrunnen-helicopter-skydive",

  // ── Winter / ski (seasonal but huge bookings)
  "ski-pass-jungfrau-grindelwald",
  "ski-pass-laax",
  "engelberg-titlis-skiing",
  "st-moritz-skiing",
  "rigi-ski-day-pass",
  "oeschinen-lake-winter",
  "bussalp-sledging-ticket-grindelwald",
  "eiger-run-sledging-ticket-eiger-express-from-grindelwald",

  // ── Hikes & nature (free entry, but bookable add-ons)
  "lauterbrunnen-valley-hike",
  "five-lakes-walk-zermatt",
  "aletsch-panorama-trail",

  // ── E-bike & cycling (rising category)
  "e-bike-tour-interlaken-valley-from-interlaken",
  "discovery-tour-e-bike-in-grindelwald",

  // ── Wellness & spa (high-margin segment)
  "day-spa-at-the-eiger-selfness-hotel-in-grindelwald",
  "day-spa-at-the-wellness-hotel-bella-vista-in-zermatt",
  "rigi-kaltbad-spa-admission-mineral-bath-incl--day-ticket-rigi-cable-car",

  // ── Day trips from major airports (backpacker SEO winners)
  "day-trip-rigi-from-lucerne",
  "rhine-falls-day-trip-from-zurich",
];

/** Quick membership check used by the content-check script. */
const set = new Set(LAUNCH_FIFTY_SLUGS);
export function isLaunchFifty(slug: string): boolean {
  return set.has(slug);
}

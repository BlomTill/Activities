#!/usr/bin/env node
/**
 * scrape-swissactivities.mjs
 *
 * Scrapes the SwissActivities.com activity catalogue and saves raw data to:
 *   .content/swissactivities-raw.json
 *
 * Strategy (in order of preference):
 *   1. __NEXT_DATA__ JSON embedded in the HTML (cleanest, structured)
 *   2. application/ld+json structured data blocks (JSON-LD)
 *   3. HTML parsing fallback (title, image, price, URL from activity cards)
 *
 * Run with:
 *   npm run scrape:swissactivities
 *
 * After this succeeds, run:
 *   npm run import:swissactivities
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, ".content");
const OUT_FILE = resolve(OUT_DIR, "swissactivities-raw.json");

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = "https://www.swissactivities.com";
const LISTING_URL = `${BASE_URL}/en-ch/activities/`;
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const AFFILIATE_REF = "ref=odbhodn";
const MAX_PAGES = 50; // safety cap — increase if they have more
const DELAY_MS = 800; // be polite to their servers

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; ExploreSwitzerland/1.0; +https://exploreswitzerland.ch)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-CH,en;q=0.9",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/** Extract __NEXT_DATA__ from a Next.js page */
function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** Extract all JSON-LD blocks from a page */
function extractJsonLd(html) {
  const results = [];
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      results.push(JSON.parse(m[1]));
    } catch {
      /* skip malformed */
    }
  }
  return results;
}

/**
 * URL structure (confirmed from two real deep links):
 *
 *   /en-ch/{parent}/{offer-slug}/?ref=odbhodn
 *
 * {parent} is EITHER a venue OR a category — both work identically:
 *   Venue:    /en-ch/pilatus-the-dragon-mountain-in-lucerne/winter-ticket-pilatus-.../
 *   Category: /en-ch/paragliding/paragliding-tandem-beatenberg-interlaken/
 *
 * Strategy:
 *   Pass 1 — collect all /en-ch/{parent}/ pages from listing pages
 *   Pass 2 — crawl each parent page to collect /en-ch/{parent}/{offer}/ URLs
 *   Pass 3 — fetch each offer page to extract structured data
 */

const SKIP_SLUGS = new Set([
  "about-us", "supplier", "widget", "blog", "families", "contact",
  "faq", "partners", "activities", "press", "jobs", "privacy", "terms",
  "imprint", "newsletter", "login", "register", "account", "search",
  "sitemap", "404", "region-", "en-ch",
]);

function isSkippedSlug(slug) {
  if (!slug) return true;
  return SKIP_SLUGS.has(slug) || [...SKIP_SLUGS].some((s) => slug.startsWith(s));
}

/** Extract venue-level pages (2 segments) — we crawl these to find ticket URLs */
function extractVenueLinksFromHtml(html) {
  const links = new Set();
  const re = /href="(\/en-ch\/([a-z0-9][a-z0-9-]+)\/)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, path, slug] = m;
    if (!isSkippedSlug(slug)) links.add(path);
  }
  return [...links];
}

/** Extract ticket-level pages (3 segments) from a venue page */
function extractTicketLinksFromHtml(html, venuePath) {
  const links = new Set();
  // Match /en-ch/{venue}/{ticket}/ — ticket slug is always under the same venue
  const escaped = venuePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`href="(${escaped}([a-z0-9][a-z0-9-]+)\/)"`, "g");
  let m;
  while ((m = re.exec(html)) !== null) {
    links.add(m[1]);
  }
  return [...links];
}

/** Extract a single activity's data from its detail page HTML */
function parseActivityPage(html, url) {
  const activity = { sourceUrl: url, affiliateUrl: `${url}?${AFFILIATE_REF}` };

  // ── Try __NEXT_DATA__ first ──
  const nextData = extractNextData(html);
  if (nextData) {
    // Dig into pageProps — structure varies by site but common paths:
    const props = nextData?.props?.pageProps;
    if (props) {
      const a = props.activity ?? props.data ?? props.offering ?? null;
      if (a) {
        activity.source = "next_data";
        activity.id = a.id ?? a.slug ?? null;
        activity.name = a.name ?? a.title ?? null;
        activity.slug = a.slug ?? null;
        activity.description = a.description ?? a.shortDescription ?? null;
        activity.longDescription = a.longDescription ?? a.content ?? a.description ?? null;
        activity.price = a.price ?? a.minPrice ?? a.priceFrom ?? null;
        activity.currency = a.currency ?? "CHF";
        activity.duration = a.duration ?? null;
        activity.category = a.category ?? a.type ?? null;
        activity.location = {
          city: a.city ?? a.location?.city ?? null,
          region: a.region ?? a.location?.region ?? null,
          canton: a.canton ?? a.location?.canton ?? null,
          lat: a.lat ?? a.location?.lat ?? a.coordinates?.lat ?? null,
          lng: a.lng ?? a.location?.lng ?? a.coordinates?.lng ?? null,
        };
        activity.imageUrl = a.imageUrl ?? a.image ?? a.heroImage ?? null;
        activity.gallery = a.gallery ?? a.images ?? [];
        activity.tags = a.tags ?? a.labels ?? [];
        activity.seasons = a.seasons ?? [];
        activity.rating = a.rating ?? a.reviewScore ?? null;
        activity.reviewCount = a.reviewCount ?? a.numReviews ?? null;
        return activity;
      }
    }
  }

  // ── Try JSON-LD ──
  const jsonLds = extractJsonLd(html);
  const touristAttraction = jsonLds.find(
    (j) =>
      j["@type"] === "TouristAttraction" ||
      j["@type"] === "Product" ||
      j["@type"] === "Event" ||
      j["@type"] === "LocalBusiness"
  );
  if (touristAttraction) {
    activity.source = "json_ld";
    activity.name = touristAttraction.name ?? null;
    activity.description = touristAttraction.description ?? null;
    activity.imageUrl =
      typeof touristAttraction.image === "string"
        ? touristAttraction.image
        : touristAttraction.image?.[0] ?? null;
    activity.location = {
      city: touristAttraction.address?.addressLocality ?? null,
      region: touristAttraction.address?.addressRegion ?? null,
      canton: null,
      lat: touristAttraction.geo?.latitude ?? null,
      lng: touristAttraction.geo?.longitude ?? null,
    };
    // Price from offers
    const offer = touristAttraction.offers ?? touristAttraction.Offers ?? null;
    if (offer) {
      const offers = Array.isArray(offer) ? offer : [offer];
      const prices = offers.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
      activity.price = prices.length ? Math.min(...prices) : null;
      activity.currency = offers[0]?.priceCurrency ?? "CHF";
    }
    activity.rating = touristAttraction.aggregateRating?.ratingValue ?? null;
    activity.reviewCount = touristAttraction.aggregateRating?.reviewCount ?? null;
    return activity;
  }

  // ── HTML fallback ──
  activity.source = "html_fallback";

  // Title: <h1> or <title>
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1) activity.name = h1[1].replace(/<[^>]+>/g, "").trim();

  // Meta description
  const metaDesc = html.match(/<meta name="description" content="([^"]+)"/);
  if (metaDesc) activity.description = metaDesc[1];

  // OG image
  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (ogImage) activity.imageUrl = ogImage[1];

  // Price — look for CHF amounts
  const priceMatch = html.match(/CHF\s*([\d',.]+)/);
  if (priceMatch) {
    activity.price = parseFloat(priceMatch[1].replace(/[']/g, "").replace(",", "."));
    activity.currency = "CHF";
  }

  return activity;
}

// ─── Sitemap approach ─────────────────────────────────────────────────────────

async function getUrlsFromSitemap() {
  console.log("📋 Trying sitemap.xml…");
  try {
    // Try both root sitemap and a potential activities-specific sitemap
    const sitemapUrls = [SITEMAP_URL, `${BASE_URL}/sitemap-activities.xml`, `${BASE_URL}/en-ch/sitemap.xml`];
    let xml = "";
    for (const su of sitemapUrls) {
      try {
        xml = await fetchHtml(su);
        if (xml.includes("<loc>")) break;
      } catch { /* try next */ }
    }

    if (!xml) return null;

    const ticketUrls = [];
    const re = /<loc>(https?:\/\/www\.swissactivities\.com\/en-ch\/[^<]+)<\/loc>/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const url = m[1].replace(/\/$/, ""); // strip trailing slash for consistent split
      const path = url.replace(BASE_URL, "");
      const parts = path.split("/").filter(Boolean);
      // We want 3-segment paths: ["en-ch", "venue-slug", "ticket-slug"]
      if (parts.length === 3 && !isSkippedSlug(parts[1]) && !isSkippedSlug(parts[2])) {
        ticketUrls.push(url + "/");
      }
    }

    if (ticketUrls.length > 0) {
      console.log(`  ✅ Found ${ticketUrls.length} ticket URLs in sitemap`);
      return ticketUrls;
    }
    console.log("  ℹ️  Sitemap found but no 3-segment ticket URLs — will crawl instead");
  } catch (e) {
    console.warn(`  ⚠️  Sitemap failed: ${e.message}`);
  }
  return null;
}

// ─── Two-pass crawl: listing pages → venue pages → ticket pages ───────────────

async function getUrlsFromListingPages() {
  console.log("📄 Pass 1: Crawling listing pages to find venue pages…");
  const venueLinks = new Set();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `${LISTING_URL}?page=${page}`;
    console.log(`  Listing page ${page}: ${url}`);
    try {
      const html = await fetchHtml(url);
      const links = extractVenueLinksFromHtml(html);

      if (links.length === 0) {
        console.log(`  ✅ No more venues on page ${page} — stopping`);
        break;
      }

      links.forEach((l) => venueLinks.add(l));
      console.log(`    Found ${links.length} venue links (total: ${venueLinks.size})`);
      await sleep(DELAY_MS);
    } catch (e) {
      console.warn(`  ⚠️  Failed on listing page ${page}: ${e.message}`);
      break;
    }
  }

  console.log(`\n📄 Pass 2: Crawling ${venueLinks.size} venue pages to find ticket URLs…`);
  const ticketLinks = new Set();
  const venueArray = [...venueLinks];

  for (let i = 0; i < venueArray.length; i++) {
    const venuePath = venueArray[i];
    const venueUrl = `${BASE_URL}${venuePath}`;
    process.stdout.write(`  [${i + 1}/${venueArray.length}] ${venuePath} … `);
    try {
      const html = await fetchHtml(venueUrl);
      const tickets = extractTicketLinksFromHtml(html, venuePath);
      tickets.forEach((t) => ticketLinks.add(`${BASE_URL}${t}`));
      console.log(`${tickets.length} ticket(s)`);
      await sleep(DELAY_MS);
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
  }

  console.log(`\n✅ Found ${ticketLinks.size} ticket URLs total`);
  return [...ticketLinks];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🇨🇭 SwissActivities scraper starting…\n");

  mkdirSync(OUT_DIR, { recursive: true });

  // Step 1: Get activity URLs
  let activityUrls = await getUrlsFromSitemap();
  if (!activityUrls || activityUrls.length === 0) {
    activityUrls = await getUrlsFromListingPages();
  }

  if (activityUrls.length === 0) {
    console.error("❌ Could not find any activity URLs. Check the site structure.");
    process.exit(1);
  }

  console.log(`\n🔍 Scraping ${activityUrls.length} activity pages…\n`);

  const activities = [];
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < activityUrls.length; i++) {
    const url = activityUrls[i];
    process.stdout.write(`  [${i + 1}/${activityUrls.length}] ${url} … `);

    try {
      const html = await fetchHtml(url);
      const activity = parseActivityPage(html, url);
      activities.push(activity);
      succeeded++;
      console.log(`✅ (${activity.source}) ${activity.name ?? "(unnamed)"}`);
    } catch (e) {
      failed++;
      console.log(`❌ ${e.message}`);
    }

    if (i < activityUrls.length - 1) await sleep(DELAY_MS);
  }

  // Write output
  const output = {
    scrapedAt: new Date().toISOString(),
    totalFound: activityUrls.length,
    succeeded,
    failed,
    activities,
  };

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");

  console.log(`\n✅ Done! ${succeeded} activities saved to ${OUT_FILE}`);
  if (failed > 0) console.log(`⚠️  ${failed} pages failed — check output above`);
  console.log("\nNext step: npm run import:swissactivities");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

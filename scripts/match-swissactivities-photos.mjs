#!/usr/bin/env node
/**
 * match-swissactivities-photos.mjs
 *
 * Reads .content/swissactivities-raw.json (already produced by
 * scrape-swissactivities.mjs) and maps the photos onto the site's
 * existing activity slugs by name + URL fuzzy matching.
 *
 * Output: src/data/activity-images-swissactivities.json
 *   {
 *     "scrapedAt": "...",
 *     "matched": <count>,
 *     "images": {
 *       "<activity-slug>": {
 *         "src": "<imgix url>",
 *         "alt": "...",
 *         "source": "swissactivities",
 *         "sourceUrl": "<original page>",
 *         "credit": { ... }
 *       }
 *     }
 *   }
 *
 * Run with:
 *   node scripts/match-swissactivities-photos.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const RAW_FILE = resolve(ROOT, ".content", "swissactivities-raw.json");
const ACTIVITIES_LIST = resolve(ROOT, ".content", "generated", "activities.list.json");
const OUT_FILE = resolve(ROOT, "src", "data", "activity-images-swissactivities.json");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function tokens(str) {
  return new Set(
    slugify(str)
      .split("-")
      .filter((t) => t.length > 2 && !STOPWORDS.has(t))
  );
}

const STOPWORDS = new Set([
  "the", "and", "for", "from", "with", "your", "into", "near",
  "experience", "tour", "ticket", "tickets", "day", "trip", "visit",
  "swiss", "switzerland", "ch", "der", "die", "das", "und", "ein", "eine",
  "of", "in", "at", "by", "an", "ist", "des",
]);

function jaccard(a, b) {
  const inter = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : inter.size / union.size;
}

/** Pull the second URL segment from a SwissActivities page URL */
function urlVenueSlug(url) {
  if (!url) return "";
  const m = String(url).match(/swissactivities\.com\/[^/]+\/([^/]+)/);
  return m ? m[1] : "";
}

/** Pull the third URL segment (the offer slug) */
function urlOfferSlug(url) {
  if (!url) return "";
  const m = String(url).match(/swissactivities\.com\/[^/]+\/[^/]+\/([^/?#]+)/);
  return m ? m[1] : "";
}

// ─── Load inputs ──────────────────────────────────────────────────────────────

console.log("📖 Reading scraped data…");
const raw = JSON.parse(readFileSync(RAW_FILE, "utf8"));
const scraped = (raw.activities || []).filter((a) => a && (a.imageUrl || (a.gallery && a.gallery.length)));
console.log(`   ${scraped.length} scraped entries with at least one photo`);

console.log("📖 Reading site activities…");
const activities = JSON.parse(readFileSync(ACTIVITIES_LIST, "utf8"));
console.log(`   ${activities.length} site activities`);

// ─── Build lookup index for scraped entries ──────────────────────────────────

// Each scraped entry can be referenced by: name slug, venue URL slug, offer URL slug.
// Photos can be reused across multiple offers at the same venue.

const byVenueSlug = new Map();   // venue slug -> [scraped entry, ...]
const byOfferSlug = new Map();   // offer slug -> [scraped entry, ...]
const byNameSlug = new Map();    // slugified name -> [scraped entry, ...]
const allEntries = [];

for (const e of scraped) {
  const photo = pickBestPhoto(e);
  if (!photo) continue;
  const entry = {
    name: e.name || "",
    photo,
    sourceUrl: e.sourceUrl || "",
    venueSlug: urlVenueSlug(e.sourceUrl),
    offerSlug: urlOfferSlug(e.sourceUrl),
    nameSlug: slugify(e.name || ""),
    nameTokens: tokens(e.name || ""),
    category: typeof e.category === "object" ? e.category.title : e.category,
    city: e.location?.city || (typeof e.location?.region === "object" ? e.location.region.title : e.location?.region),
  };
  allEntries.push(entry);
  if (entry.venueSlug) {
    if (!byVenueSlug.has(entry.venueSlug)) byVenueSlug.set(entry.venueSlug, []);
    byVenueSlug.get(entry.venueSlug).push(entry);
  }
  if (entry.offerSlug) {
    if (!byOfferSlug.has(entry.offerSlug)) byOfferSlug.set(entry.offerSlug, []);
    byOfferSlug.get(entry.offerSlug).push(entry);
  }
  if (entry.nameSlug) {
    if (!byNameSlug.has(entry.nameSlug)) byNameSlug.set(entry.nameSlug, []);
    byNameSlug.get(entry.nameSlug).push(entry);
  }
}

function pickBestPhoto(e) {
  // Prefer a wide gallery photo over the small imageUrl
  const gallery = (e.gallery || []).filter((g) => g && g.url);
  if (gallery.length) {
    return {
      url: gallery[0].url,
      alt: gallery[0].alternativeText || gallery[0].caption || e.name,
    };
  }
  if (e.imageUrl) {
    return { url: e.imageUrl, alt: e.name };
  }
  return null;
}

console.log(`   ${allEntries.length} scraped entries indexed`);
console.log(`   ${byVenueSlug.size} unique venue slugs`);
console.log(`   ${byOfferSlug.size} unique offer slugs`);

// ─── Match ────────────────────────────────────────────────────────────────────

const out = {};
const stats = { exactSlug: 0, exactNameSlug: 0, fuzzy: 0, none: 0 };

for (const a of activities) {
  const aSlug = a.slug;
  const aName = a.name;
  const aTokens = tokens(aName);
  const aCity = a.location?.city || "";
  const aRegion = a.location?.region || "";

  // 1. Exact match: site slug = scraped offer slug
  if (byOfferSlug.has(aSlug)) {
    const e = byOfferSlug.get(aSlug)[0];
    out[aSlug] = makeOut(a, e);
    stats.exactSlug++;
    continue;
  }

  // 2. Exact match: site slug = scraped venue slug
  if (byVenueSlug.has(aSlug)) {
    const e = byVenueSlug.get(aSlug)[0];
    out[aSlug] = makeOut(a, e);
    stats.exactSlug++;
    continue;
  }

  // 3. Exact match: slugified name match
  const nameSlug = slugify(aName);
  if (byNameSlug.has(nameSlug)) {
    const e = byNameSlug.get(nameSlug)[0];
    out[aSlug] = makeOut(a, e);
    stats.exactNameSlug++;
    continue;
  }

  // 4. Fuzzy: best Jaccard similarity on tokens, must include city if present.
  let best = null;
  let bestScore = 0;
  for (const e of allEntries) {
    let score = jaccard(aTokens, e.nameTokens);
    // Boost if city matches
    if (aCity && e.city && slugify(aCity) === slugify(e.city)) score += 0.15;
    // Boost if venue/offer slug is a substring of activity slug or vice versa
    if (e.venueSlug && (aSlug.includes(e.venueSlug) || e.venueSlug.includes(aSlug))) score += 0.2;
    if (e.offerSlug && (aSlug.includes(e.offerSlug) || e.offerSlug.includes(aSlug))) score += 0.2;
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }

  // Threshold: 0.7 — strict enough to keep photos accurate.
  // Below this we'd rather show a category fallback than a wrong photo.
  if (best && bestScore >= 0.7) {
    out[aSlug] = makeOut(a, best, bestScore);
    stats.fuzzy++;
  } else {
    stats.none++;
  }
}

function makeOut(a, e, score) {
  return {
    src: e.photo.url,
    alt: e.photo.alt || a.name,
    source: "swissactivities",
    sourceUrl: e.sourceUrl,
    credit: {
      author: "SwissActivities",
      sourceUrl: e.sourceUrl,
    },
    matchedBy: score ? `fuzzy:${score.toFixed(2)}` : "exact",
  };
}

// ─── Write output ─────────────────────────────────────────────────────────────

const result = {
  scrapedAt: raw.scrapedAt || new Date().toISOString(),
  totalSiteActivities: activities.length,
  matched: Object.keys(out).length,
  stats,
  images: out,
};

writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
console.log(`\n✅ Wrote ${OUT_FILE}`);
console.log(`   matched ${result.matched}/${activities.length} activities`);
console.log(`     ${stats.exactSlug} exact slug match`);
console.log(`     ${stats.exactNameSlug} exact name match`);
console.log(`     ${stats.fuzzy} fuzzy match`);
console.log(`     ${stats.none} unmatched (will fall back to next image source)`);

#!/usr/bin/env node
/**
 * import-swissactivities.mjs
 *
 * Reads .content/swissactivities-raw.json (produced by scrape-swissactivities.mjs)
 * and transforms each activity into the site's Activity format, then appends
 * them to src/data/activities.ts — skipping any that already exist.
 *
 * Run with:
 *   npm run import:swissactivities
 *
 * After importing, run:
 *   npm run content:build
 * to regenerate .content/generated/ files.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const RAW_FILE = resolve(ROOT, ".content", "swissactivities-raw.json");
const ACTIVITIES_FILE = resolve(ROOT, "src", "data", "activities.ts");
const AFFILIATE_REF = "ref=odbhodn";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[äàâ]/g, "a")
    .replace(/[éèê]/g, "e")
    .replace(/[îï]/g, "i")
    .replace(/[öôò]/g, "o")
    .replace(/[üû]/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Read the existing activity slugs from activities.ts to avoid duplicates */
function readExistingSlugs(source) {
  const slugs = new Set();
  const re = /slug:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    slugs.add(m[1]);
  }
  return slugs;
}

/** Read the highest existing numeric id from activities.ts */
function readHighestId(source) {
  let highest = 0;
  const re = /id:\s*["'](\d+)["']/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const n = parseInt(m[1], 10);
    if (n > highest) highest = n;
  }
  return highest;
}

/**
 * Map SwissActivities category strings → our Category type
 * ("outdoor" | "culture" | "adventure" | "family" | "wellness")
 */
function mapCategory(raw) {
  if (!raw) return "outdoor";
  const r = (Array.isArray(raw) ? raw.join(" ") : String(raw)).toLowerCase();
  if (r.includes("adventure") || r.includes("abenteuer") || r.includes("extreme")) return "adventure";
  if (r.includes("culture") || r.includes("kultur") || r.includes("museum") || r.includes("history")) return "culture";
  if (r.includes("family") || r.includes("familie") || r.includes("kids") || r.includes("children")) return "family";
  if (r.includes("wellness") || r.includes("spa") || r.includes("thermal") || r.includes("relax")) return "wellness";
  return "outdoor";
}

/** Infer seasons from category/description text */
function inferSeasons(raw) {
  const text = JSON.stringify(raw).toLowerCase();
  const seasons = [];
  if (text.includes("spring") || text.includes("frühling") || text.includes("printemps")) seasons.push("spring");
  if (text.includes("summer") || text.includes("sommer") || text.includes("été")) seasons.push("summer");
  if (text.includes("autumn") || text.includes("fall") || text.includes("herbst") || text.includes("automne")) seasons.push("autumn");
  if (text.includes("winter") || text.includes("ski") || text.includes("snow") || text.includes("schnee")) seasons.push("winter");
  // If nothing found, assume all year
  return seasons.length > 0 ? seasons : ["spring", "summer", "autumn", "winter"];
}

/** Infer indoor/outdoor from name/description */
function inferIndoor(raw) {
  const text = JSON.stringify(raw).toLowerCase();
  return (
    text.includes("museum") ||
    text.includes("indoor") ||
    text.includes("theater") ||
    text.includes("spa") ||
    text.includes("thermal") ||
    text.includes("restaurant") ||
    text.includes("factory") ||
    text.includes("fabrik")
  );
}

/**
 * Build the Swiss Activities affiliate booking URL.
 * Source URL format: https://www.swissactivities.com/en-ch/{venue}/{ticket}/
 * Affiliate URL:     same + ?ref=odbhodn
 */
function buildAffiliateUrl(sourceUrl) {
  const url = sourceUrl.endsWith("/") ? sourceUrl : sourceUrl + "/";
  return `${url}?${AFFILIATE_REF}`;
}

/**
 * Derive a clean slug from the source URL.
 * Uses the ticket segment (most specific) — falls back to name-based slug.
 * e.g. /en-ch/pilatus-the-dragon-mountain-in-lucerne/winter-ticket-pilatus-.../ → winter-ticket-pilatus-...
 */
function slugFromUrl(sourceUrl) {
  try {
    const parts = new URL(sourceUrl).pathname.split("/").filter(Boolean);
    // parts = ["en-ch", "venue-slug", "ticket-slug"]
    if (parts.length >= 3) return parts[2]; // ticket slug is most specific
    if (parts.length === 2) return parts[1]; // venue-only fallback
  } catch { /* ignore */ }
  return null;
}

/**
 * Extract tags from available text fields.
 * Returns an array of lowercase short strings.
 */
function extractTags(raw) {
  const tags = new Set();
  const text = `${raw.name ?? ""} ${raw.description ?? ""} ${raw.category ?? ""}`.toLowerCase();

  const keywords = [
    "hiking", "skiing", "snowboarding", "paragliding", "kayaking", "rafting",
    "climbing", "cycling", "biking", "swimming", "sailing", "canyoning",
    "museum", "castle", "lake", "mountain", "glacier", "river", "waterfall",
    "family", "kids", "romantic", "scenic", "adventure", "wellness", "spa",
    "chocolate", "cheese", "wine", "fondue", "watch", "boat", "train",
    "cable car", "gondola", "zipline", "bungee", "yoga", "thermal",
    "zürich", "zermatt", "interlaken", "lucerne", "geneva", "bern",
    "grindelwald", "st. moritz", "davos", "lugano", "lausanne",
  ];
  for (const kw of keywords) {
    if (text.includes(kw)) tags.add(kw.replace(/\s+/g, "-"));
  }
  return [...tags].slice(0, 8);
}

/**
 * Transform one raw scraped activity → Activity object string (TypeScript literal)
 */
function transformActivity(raw, id) {
  const name = raw.name ?? "Unknown Activity";
  const slug = raw.slug ?? slugFromUrl(raw.sourceUrl) ?? slugify(name);
  const price = raw.price ?? 0;
  const currency = raw.currency ?? "CHF";
  const affiliateUrl = buildAffiliateUrl(raw.sourceUrl);
  const category = mapCategory(raw.category);
  const seasons = inferSeasons(raw);
  const indoor = inferIndoor(raw);
  const tags = extractTags(raw);
  const imageUrl = raw.imageUrl ?? "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&h=500&fit=crop";
  const description = raw.description ?? `Discover ${name} in Switzerland.`;
  const longDescription = raw.longDescription ?? description;

  // Pricing: SwissActivities typically shows one price (adult).
  // We approximate child/student/senior from the adult price.
  const adultPrice = typeof price === "number" && price > 0 ? price : 0;
  const childPrice = adultPrice > 0 ? Math.round(adultPrice * 0.5) : 0;
  const studentPrice = adultPrice > 0 ? Math.round(adultPrice * 0.8) : 0;
  const seniorPrice = adultPrice > 0 ? Math.round(adultPrice * 0.9) : 0;

  const city = raw.location?.city ?? "Switzerland";
  const region = raw.location?.region ?? "Switzerland";
  const canton = raw.location?.canton ?? "";
  const lat = raw.location?.lat ?? 46.8182;
  const lng = raw.location?.lng ?? 8.2275;

  const ratingVal = parseFloat(raw.rating ?? 4.4);
  const rating = Math.min(5.0, Math.max(1.0, isNaN(ratingVal) ? 4.4 : parseFloat(ratingVal.toFixed(1))));

  // Highlight what we know
  const highlights = [];
  if (raw.duration) highlights.push(`{label:"Duration",value:${JSON.stringify(raw.duration)}}`);
  if (adultPrice > 0) highlights.push(`{label:"From",value:"CHF ${adultPrice}"}`);
  if (raw.reviewCount) highlights.push(`{label:"Reviews",value:${JSON.stringify(String(raw.reviewCount))}}`);
  if (city !== "Switzerland") highlights.push(`{label:"Location",value:${JSON.stringify(city)}}`);

  const seasonsStr = JSON.stringify(seasons);
  const tagsStr = JSON.stringify(tags);
  const galleryStr = raw.gallery?.length
    ? JSON.stringify(raw.gallery)
    : `["${imageUrl}"]`;
  const highlightsStr = highlights.length ? `[${highlights.join(",")}]` : "[]";

  return `  {
    id: "${id}",
    slug: "${slug}",
    name: ${JSON.stringify(name)},
    description: ${JSON.stringify(description)},
    longDescription: ${JSON.stringify(longDescription)},
    category: "${category}",
    subcategory: ${JSON.stringify(raw.category ?? category)},
    location: { region: ${JSON.stringify(region)}, canton: ${JSON.stringify(canton)}, city: ${JSON.stringify(city)}, coordinates: { lat: ${lat}, lng: ${lng} } },
    seasons: ${seasonsStr},
    indoor: ${indoor},
    providers: [
      {
        name: "SwissActivities",
        pricing: { child: ${childPrice}, student: ${studentPrice}, adult: ${adultPrice}, senior: ${seniorPrice} },
        bookingUrl: ${JSON.stringify(affiliateUrl)},
        rating: ${rating},
        description: "Switzerland's largest activities marketplace — book securely online",
      },
    ],
    currency: "CHF",
    duration: ${JSON.stringify(raw.duration ?? "Varies")},
    imageUrl: ${JSON.stringify(imageUrl)},
    gallery: ${galleryStr},
    highlights: ${highlightsStr},
    tags: ${tagsStr},
    featured: false,
  },`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // 1. Load raw scraped data
  if (!existsSync(RAW_FILE)) {
    console.error(`❌ Raw file not found: ${RAW_FILE}`);
    console.error("   Run: npm run scrape:swissactivities first");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(RAW_FILE, "utf8"));
  console.log(`📦 Loaded ${raw.activities.length} scraped activities (scraped ${raw.scrapedAt})`);

  // 2. Load existing activities.ts
  const source = readFileSync(ACTIVITIES_FILE, "utf8");
  const existingSlugs = readExistingSlugs(source);
  let nextId = readHighestId(source) + 1;

  console.log(`📋 Existing activities: ${existingSlugs.size} (highest id: ${nextId - 1})`);

  // 3. Filter out dupes
  const toImport = raw.activities.filter((a) => {
    if (!a.name) return false;
    const slug = a.slug ?? slugify(a.name);
    if (existingSlugs.has(slug)) {
      console.log(`  ⏭️  Skip (already exists): ${slug}`);
      return false;
    }
    return true;
  });

  console.log(`\n🆕 New activities to import: ${toImport.length}\n`);

  if (toImport.length === 0) {
    console.log("Nothing to import. All activities already exist.");
    return;
  }

  // 4. Build TypeScript literals
  const newEntries = toImport.map((a) => {
    const entry = transformActivity(a, String(nextId++));
    console.log(`  ✅ ${a.name ?? "(unnamed)"} → ${a.slug ?? slugify(a.name ?? "")}`);
    return entry;
  });

  // 5. Inject before the closing ]; of the activities array
  // The file ends with:  ];  (possibly with trailing newline)
  const insertMarker = "];";
  const insertIdx = source.lastIndexOf(insertMarker);
  if (insertIdx < 0) {
    console.error("❌ Could not find closing ]; in activities.ts — aborting");
    process.exit(1);
  }

  const header = `\n  // ─── SWISSACTIVITIES IMPORT (${new Date().toISOString().slice(0, 10)}) ──────────────────────────\n`;
  const block = header + newEntries.join("\n") + "\n";

  const updated = source.slice(0, insertIdx) + block + source.slice(insertIdx);
  writeFileSync(ACTIVITIES_FILE, updated, "utf8");

  console.log(`\n✅ Imported ${toImport.length} activities into src/data/activities.ts`);
  console.log("📌 Next steps:");
  console.log("   1. npm run content:build   — regenerate .content/generated/");
  console.log("   2. npm run dev             — preview the new activity pages");
  console.log("   3. Review imported entries in src/data/activities.ts");
  console.log("      (long descriptions and pricing may need manual polish)");
}

main();

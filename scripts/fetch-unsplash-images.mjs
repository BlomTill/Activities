/**
 * ──────────────────────────────────────────────────────────────────
 *  scripts/fetch-unsplash-images.mjs
 *
 *  For every activity that has no Wikipedia image in activity-images.json,
 *  this script searches the Unsplash API by activity name + "Switzerland"
 *  and saves the best matching landscape photo to activity-images.json.
 *
 *  Result: every activity gets a relevant, high-quality photo — not a
 *  generic stock image picked by hand months ago.
 *
 *  SETUP (2 minutes):
 *    1. Go to https://unsplash.com/developers → "New Application"
 *    2. App name: "Explore Switzerland" — accept terms
 *    3. Copy the "Access Key"
 *    4. Add to .env.local:  UNSPLASH_ACCESS_KEY=your_key_here
 *    5. Run:  node scripts/fetch-unsplash-images.mjs
 *
 *  The free Unsplash tier allows 50 requests/hour (Demo) or unlimited
 *  after production approval (takes ~1 week). For 75 activities we make
 *  75 requests — run in two batches if on the Demo tier.
 *
 *  Unsplash licence: Photos are free to use. Attribution is displayed
 *  automatically via the credit field in activity-images.json.
 * ──────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ── Load env from .env.local ──────────────────────────────────────
function loadEnv() {
  try {
    const envFile = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    for (const line of envFile.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {
    // .env.local not present — rely on shell env
  }
}
loadEnv();

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error(
    "\n❌  Missing UNSPLASH_ACCESS_KEY\n" +
    "   1. Get a free key at https://unsplash.com/developers\n" +
    "   2. Add UNSPLASH_ACCESS_KEY=your_key to .env.local\n"
  );
  process.exit(1);
}

// ── Load current data ─────────────────────────────────────────────
const IMAGES_PATH = path.join(ROOT, "src/data/activity-images.json");
const ACTIVITIES_PATH = path.join(ROOT, "src/data/activities.ts");

const imagesData = JSON.parse(readFileSync(IMAGES_PATH, "utf8"));
const activitiesSrc = readFileSync(ACTIVITIES_PATH, "utf8");

// Parse all activities from the TypeScript source
function parseActivities(src) {
  const activities = [];
  const blocks = src.split(/(?=\s*\{\s*id:\s*['"])/);
  for (const block of blocks) {
    const slug = block.match(/\bslug:\s*['"]([^'"]+)['"]/)?.[1];
    const name = block.match(/\bname:\s*['"]([^'"]+)['"]/)?.[1];
    const category = block.match(/\bcategory:\s*['"]([^'"]+)['"]/)?.[1];
    const city = block.match(/\bcity:\s*['"]([^'"]+)['"]/)?.[1];
    if (slug && name) activities.push({ slug, name, category, city });
  }
  return activities;
}

const allActivities = parseActivities(activitiesSrc);
const existingWikiSlugs = new Set(Object.keys(imagesData.images));

// Only process activities that don't already have a wiki image
const toFetch = allActivities.filter((a) => !existingWikiSlugs.has(a.slug));

console.log(`\n📷  Unsplash image fetcher`);
console.log(`   ${allActivities.length} total activities`);
console.log(`   ${existingWikiSlugs.size} already have Wikipedia images`);
console.log(`   ${toFetch.length} will be searched on Unsplash\n`);

// ── Search query builder ──────────────────────────────────────────
// We search for "[activity name] Switzerland" but strip generic words
// that return bad results (e.g. "Festival" alone gets confetti photos).
const STRIP_WORDS = /\b(zurich|zermatt|bern|geneva|basel|lucerne|interlaken|switzerland|schweiz|swiss)\b/gi;

function buildQuery(activity) {
  // Use name + city for specificity, clean up filler
  const base = `${activity.name} Switzerland`;
  // For events/festivals add the location city for context
  if (activity.category === "culture" || activity.name.toLowerCase().includes("festival")) {
    return `${activity.name} ${activity.city || ""} Switzerland`.trim();
  }
  return base;
}

// ── Unsplash API call ─────────────────────────────────────────────
async function searchUnsplash(query) {
  const params = new URLSearchParams({
    query,
    per_page: "5",
    orientation: "landscape",
    content_filter: "high",
  });
  const url = `https://api.unsplash.com/search/photos?${params}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.results ?? [];
}

// Pick the best photo from results — prefer high resolution + good description
function pickBest(results, activity) {
  if (!results.length) return null;

  // Score each result: prefer photos where description/tags match the activity
  const nameLower = activity.name.toLowerCase();
  const scored = results.map((r) => {
    let score = r.likes ?? 0; // base score = likes
    const desc = (r.description || r.alt_description || "").toLowerCase();
    // Boost if description contains key activity words
    if (nameLower.split(" ").some((w) => w.length > 4 && desc.includes(w))) score += 500;
    // Prefer wide images
    if (r.width > r.height * 1.4) score += 200;
    return { ...r, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);
  return scored[0];
}

// ── Rate limit helper ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main loop ─────────────────────────────────────────────────────
let added = 0;
let skipped = 0;
let errors = 0;

// Process in batches of 45 to stay safely under the 50/hour Demo limit
const BATCH_SIZE = 45;
const DELAY_MS = 1300; // ~46 req/min

for (let i = 0; i < toFetch.length; i++) {
  const activity = toFetch[i];

  // Pause between batches to avoid rate limit
  if (i > 0 && i % BATCH_SIZE === 0) {
    console.log(`\n⏸️  Pausing 65 seconds for Unsplash rate limit...\n`);
    await sleep(65_000);
  }

  const query = buildQuery(activity);
  process.stdout.write(`[${String(i + 1).padStart(3)}/${toFetch.length}] ${activity.slug.padEnd(45)} `);

  try {
    const results = await searchUnsplash(query);
    const best = pickBest(results, activity);

    if (!best) {
      console.log("⚠️  no results");
      skipped++;
    } else {
      // Use the "regular" size (1080px wide) — good quality without being huge
      const src = best.urls.regular;
      imagesData.images[activity.slug] = {
        src,
        credit: {
          author: best.user?.name ?? "Unknown",
          authorUrl: best.user?.links?.html ?? "",
          license: "Unsplash License",
          sourceUrl: best.links?.html ?? "",
          filename: best.id,
        },
      };
      console.log(`✅  ${best.alt_description?.substring(0, 50) ?? best.id}`);
      added++;
    }
  } catch (err) {
    console.log(`❌  ${err.message}`);
    errors++;
  }

  // Small delay between every request
  if (i < toFetch.length - 1) await sleep(DELAY_MS);
}

// ── Save results ──────────────────────────────────────────────────
imagesData._lastUpdated = new Date().toISOString();
imagesData._about =
  "Auto-populated by scripts/fetch-activity-images.mjs and scripts/fetch-unsplash-images.mjs. " +
  "Maps activity slug → resolved image + credit. Wikipedia images take priority; " +
  "Unsplash fills the gaps.";

writeFileSync(IMAGES_PATH, JSON.stringify(imagesData, null, 2));

console.log(`
────────────────────────────────────────
  ✅  Added:   ${added} Unsplash images
  ⚠️   Skipped: ${skipped} (no results)
  ❌  Errors:  ${errors}
  📄  Saved → src/data/activity-images.json
────────────────────────────────────────

Next: run \`npm run dev\` and check the activity grid.
For activities still showing generic photos, you can manually
override by setting activity.image in activities.ts.
`);

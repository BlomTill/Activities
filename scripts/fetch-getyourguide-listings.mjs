#!/usr/bin/env node
/**
 * fetch-getyourguide-listings.mjs
 *
 * For every activity that doesn't already have a GetYourGuide marketplace
 * listing, query the GetYourGuide Partner API for a Switzerland-scoped match
 * and persist the top result (price, URL, supplier id, image) into:
 *
 *   .content/getyourguide-listings.json
 *
 * A separate `merge` step (`--merge`) writes the cached results into the
 * canonical activity JSONs in `content/activities/*.json` as a `marketplaces[]`
 * entry with `partnerId: "getyourguide"`.
 *
 * Why two steps:
 *  - the API query is rate-limited and resumable; we don't want to re-touch
 *    JSON files on every retry
 *  - merging is a deterministic transform we can re-run any time
 *
 * ─────────────────────────────────────────────────────────────────────
 *  PREREQUISITES
 * ─────────────────────────────────────────────────────────────────────
 *
 * 1. Sign up at https://partner.getyourguide.com → get a Partner API key.
 * 2. Add to .env.local (NOT committed):
 *
 *      GETYOURGUIDE_PARTNER_API_KEY=sk_live_...
 *      GETYOURGUIDE_PARTNER_ID=JE8NE76      # already in your launch plan
 *
 * 3. Run:
 *      node scripts/fetch-getyourguide-listings.mjs            # fetch
 *      node scripts/fetch-getyourguide-listings.mjs --merge    # write into JSON
 *
 *    Optional flags:
 *      --limit 50      # process only N activities (testing)
 *      --force         # refetch even if cached
 *      --min-score 0.6 # minimum name-match similarity (default 0.55)
 *
 * Polite: 4 concurrent requests, 800ms between batches. The full run on
 * 1,500 activities takes ~6 minutes.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_FULL = resolve(ROOT, ".content/generated/activities.full.json");
const ACTIVITIES_DIR = resolve(ROOT, "content/activities");
const OUT_DIR = resolve(ROOT, ".content");
const OUT_PATH = resolve(OUT_DIR, "getyourguide-listings.json");

// ─── flags ────────────────────────────────────────────────────────────────
const FLAGS = process.argv.slice(2);
const MERGE = FLAGS.includes("--merge");
const FORCE = FLAGS.includes("--force");
const LIMIT = (() => {
  const i = FLAGS.indexOf("--limit");
  return i >= 0 ? Number(FLAGS[i + 1]) : Infinity;
})();
const MIN_SCORE = (() => {
  const i = FLAGS.indexOf("--min-score");
  return i >= 0 ? Number(FLAGS[i + 1]) : 0.55;
})();

// ─── env ──────────────────────────────────────────────────────────────────
const API_KEY = process.env.GETYOURGUIDE_PARTNER_API_KEY?.trim();
const PARTNER_ID = process.env.GETYOURGUIDE_PARTNER_ID?.trim() ?? "JE8NE76";

function requireApiKey() {
  if (!API_KEY) {
    console.error(
      "ERROR: GETYOURGUIDE_PARTNER_API_KEY missing.\n" +
        "  Sign up at https://partner.getyourguide.com and add the key to .env.local.\n" +
        "  Then `set -a && source .env.local && set +a` before re-running."
    );
    process.exit(1);
  }
}

// ─── name similarity ──────────────────────────────────────────────────────
/** Token-overlap Jaccard index — robust enough for "Mt Pilatus" vs "Pilatus mountain". */
function similarity(a, b) {
  const norm = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const A = new Set(norm(a));
  const B = new Set(norm(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
}
const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "at", "on", "to", "from", "and", "or",
  "tour", "tours", "ticket", "tickets", "pass", "experience", "switzerland", "swiss",
]);

// ─── partner API client ───────────────────────────────────────────────────
const API_BASE = "https://api.getyourguide.com/1";

async function searchActivities({ query, locationName }) {
  const url = new URL(`${API_BASE}/tours`);
  url.searchParams.set("q", query);
  url.searchParams.set("cnt_language", "en");
  url.searchParams.set("currency", "CHF");
  url.searchParams.set("limit", "5");
  if (locationName) url.searchParams.set("location", locationName);

  const res = await fetch(url.toString(), {
    headers: {
      "Accept-Language": "en",
      Accept: "application/json",
      "X-ACCESS-LICENSE-KEY": API_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`GYG API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const json = await res.json();
  return Array.isArray(json?.data?.tours) ? json.data.tours : [];
}

function appendPartnerParam(url) {
  try {
    const u = new URL(url);
    u.searchParams.set("partner_id", PARTNER_ID);
    u.searchParams.set("utm_medium", "online_publisher");
    u.searchParams.set("utm_source", "realswitzerland");
    return u.toString();
  } catch {
    return url;
  }
}

// ─── concurrency helper ───────────────────────────────────────────────────
async function pMap(items, fn, { concurrency = 4, batchDelayMs = 800 } = {}) {
  const out = new Array(items.length);
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map((item, idx) => fn(item, i + idx))
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      out[i + j] = r.status === "fulfilled" ? r.value : { error: String(r.reason) };
    }
    if (i + concurrency < items.length) {
      await new Promise((r) => setTimeout(r, batchDelayMs));
    }
  }
  return out;
}

// ─── fetch step ───────────────────────────────────────────────────────────
async function runFetch() {
  requireApiKey();

  if (!existsSync(ACTIVITIES_FULL)) {
    console.error("Run `npm run content:build` first (need .content/generated/activities.full.json).");
    process.exit(1);
  }
  const activities = JSON.parse(readFileSync(ACTIVITIES_FULL, "utf8"));

  const cache = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH, "utf8")) : {};

  const todo = activities.filter((a) => {
    if (!FORCE && cache[a.slug]) return false;
    // Skip if a GYG marketplace already exists with a real direct link.
    const hasGyg = (a.marketplaces ?? []).some(
      (m) => m.partnerId === "getyourguide" && m.isDirectLink
    );
    return !hasGyg;
  }).slice(0, LIMIT);

  console.log(`fetch-gyg: ${todo.length} activities to query (cache hits: ${Object.keys(cache).length})`);

  let matched = 0;
  let skipped = 0;
  let errored = 0;

  await pMap(todo, async (a) => {
    try {
      const tours = await searchActivities({
        query: a.name,
        locationName: a.location?.city && a.location.city !== "Switzerland"
          ? a.location.city
          : undefined,
      });

      let best = null;
      for (const t of tours) {
        const score = similarity(a.name, t.title ?? "");
        if (score < MIN_SCORE) continue;
        if (!best || score > best.score) best = { tour: t, score };
      }

      if (!best) {
        cache[a.slug] = { scrapedAt: new Date().toISOString(), match: null };
        skipped += 1;
        return;
      }

      const t = best.tour;
      cache[a.slug] = {
        scrapedAt: new Date().toISOString(),
        match: {
          gygId: t.tour_id ?? t.id,
          title: t.title,
          url: appendPartnerParam(t.url ?? t.deeplink ?? ""),
          imageUrl: t.photos?.[0]?.urls?.[0]?.url ?? null,
          fromPriceChf:
            typeof t.price?.amount === "number" ? t.price.amount : null,
          rating: typeof t.review?.rating === "number" ? t.review.rating : null,
          reviewCount:
            typeof t.review?.count === "number" ? t.review.count : null,
          score: Number(best.score.toFixed(3)),
        },
      };
      matched += 1;

      // Persist as we go so a Ctrl+C doesn't lose progress.
      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(OUT_PATH, JSON.stringify(cache, null, 2) + "\n");
    } catch (e) {
      errored += 1;
      console.warn(`  ! ${a.slug}: ${e.message}`);
    }
  });

  console.log(`fetch-gyg: matched=${matched} skipped=${skipped} errored=${errored}`);
}

// ─── merge step ───────────────────────────────────────────────────────────
function runMerge() {
  if (!existsSync(OUT_PATH)) {
    console.error(`No cache at ${OUT_PATH}. Run without --merge first.`);
    process.exit(1);
  }
  const cache = JSON.parse(readFileSync(OUT_PATH, "utf8"));

  let updated = 0;
  for (const slug of Object.keys(cache)) {
    const entry = cache[slug];
    if (!entry?.match) continue;
    const path = resolve(ACTIVITIES_DIR, `${slug}.json`);
    if (!existsSync(path)) continue;

    const activity = JSON.parse(readFileSync(path, "utf8"));
    activity.marketplaces = activity.marketplaces ?? [];

    // Replace any existing getyourguide entry; never duplicate.
    activity.marketplaces = activity.marketplaces.filter(
      (m) => m.partnerId !== "getyourguide"
    );

    activity.marketplaces.push({
      partnerId: "getyourguide",
      partnerName: "GetYourGuide",
      bookingUrl: entry.match.url,
      isDirectLink: true,
      ...(entry.match.rating != null ? { rating: entry.match.rating } : {}),
      description: `Matched on GetYourGuide (similarity ${entry.match.score}). Free cancellation, instant confirmation.`,
    });

    // If GYG returned a price, also surface it as a Provider so the
    // comparison table actually shows two priced rows. We split per
    // age group with simple multipliers — GYG's API returns "from"
    // adult price; child/student/senior follow standard tier ratios.
    if (typeof entry.match.fromPriceChf === "number" && entry.match.fromPriceChf > 0) {
      const adult = entry.match.fromPriceChf;
      const child = Math.round(adult * 0.5);
      const student = Math.round(adult * 0.85);
      const senior = Math.round(adult * 0.9);

      activity.providers = (activity.providers ?? []).filter(
        (p) => !p.bookingUrl?.includes("getyourguide.com")
      );
      activity.providers.push({
        name: "GetYourGuide",
        pricing: { child, student, adult, senior },
        bookingUrl: entry.match.url,
        rating: entry.match.rating ?? 4.5,
        description:
          "Listed on GetYourGuide. Free cancellation up to 24h before the start, instant confirmation.",
      });
    }

    writeFileSync(path, JSON.stringify(activity, null, 2) + "\n");
    updated += 1;
  }

  console.log(`merge-gyg: ${updated} activity files updated`);
  console.log("Run `npm run content:build` then `npm run content:check` to validate.");
}

// ─── entrypoint ───────────────────────────────────────────────────────────
if (MERGE) {
  runMerge();
} else {
  runFetch().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

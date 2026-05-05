#!/usr/bin/env node
/**
 * fetch-viator-listings.mjs
 *
 * Same shape as fetch-getyourguide-listings.mjs but targets Viator's
 * Affiliate API (viatorpartner.com). Two passes:
 *
 *   node scripts/fetch-viator-listings.mjs            # query API → cache
 *   node scripts/fetch-viator-listings.mjs --merge    # cache → activity JSONs
 *
 * Cache file:  .content/viator-listings.json
 *
 * ─────────────────────────────────────────────────────────────────────
 *  PREREQUISITES
 * ─────────────────────────────────────────────────────────────────────
 *
 * 1. Sign up at https://www.viatorpartner.com → request API access
 *    (Viator approves API keys per partner; can take 1–3 business days).
 * 2. Add to .env.local:
 *
 *      VIATOR_AFFILIATE_API_KEY=...
 *      VIATOR_PARTNER_PID=P00299712      # already in your launch plan
 *      VIATOR_MCID=42383
 *
 * Polite: 4 concurrent, 1000ms between batches (Viator rate-limits more
 * strictly than GYG).
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_FULL = resolve(ROOT, ".content/generated/activities.full.json");
const ACTIVITIES_DIR = resolve(ROOT, "content/activities");
const OUT_DIR = resolve(ROOT, ".content");
const OUT_PATH = resolve(OUT_DIR, "viator-listings.json");

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

const API_KEY = process.env.VIATOR_AFFILIATE_API_KEY?.trim();
const PID = process.env.VIATOR_PARTNER_PID?.trim() ?? "P00299712";
const MCID = process.env.VIATOR_MCID?.trim() ?? "42383";

function requireApiKey() {
  if (!API_KEY) {
    console.error(
      "ERROR: VIATOR_AFFILIATE_API_KEY missing.\n" +
        "  Sign up at https://www.viatorpartner.com → request API access.\n" +
        "  Add the key to .env.local, then re-run."
    );
    process.exit(1);
  }
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "at", "on", "to", "from", "and", "or",
  "tour", "tours", "ticket", "tickets", "pass", "experience", "switzerland", "swiss",
]);
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

const VIATOR_GEO_SWITZERLAND = 60188; // top-level country geoCode

async function searchProducts({ query }) {
  const res = await fetch("https://api.viator.com/partner/products/search", {
    method: "POST",
    headers: {
      "exp-api-key": API_KEY,
      Accept: "application/json;version=2.0",
      "Accept-Language": "en-US",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filtering: {
        destination: VIATOR_GEO_SWITZERLAND,
        searchTerm: query,
      },
      sorting: { sort: "RELEVANCE" },
      pagination: { offset: 0, count: 5 },
      currency: "CHF",
    }),
  });
  if (!res.ok) {
    throw new Error(`Viator API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const json = await res.json();
  return Array.isArray(json?.products) ? json.products : [];
}

function appendPartnerParam(url) {
  try {
    const u = new URL(url);
    u.searchParams.set("pid", PID);
    u.searchParams.set("mcid", MCID);
    u.searchParams.set("medium", "link");
    return u.toString();
  } catch {
    return url;
  }
}

async function pMap(items, fn, { concurrency = 4, batchDelayMs = 1000 } = {}) {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.allSettled(batch.map((item, idx) => fn(item, i + idx)));
    if (i + concurrency < items.length) await new Promise((r) => setTimeout(r, batchDelayMs));
  }
}

async function runFetch() {
  requireApiKey();
  if (!existsSync(ACTIVITIES_FULL)) {
    console.error("Run `npm run content:build` first.");
    process.exit(1);
  }
  const activities = JSON.parse(readFileSync(ACTIVITIES_FULL, "utf8"));
  const cache = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH, "utf8")) : {};

  const todo = activities.filter((a) => {
    if (!FORCE && cache[a.slug]) return false;
    const hasViator = (a.marketplaces ?? []).some(
      (m) => m.partnerId === "viator" && m.isDirectLink
    );
    return !hasViator;
  }).slice(0, LIMIT);

  console.log(`fetch-viator: ${todo.length} activities to query (cache: ${Object.keys(cache).length})`);

  let matched = 0;
  let skipped = 0;
  let errored = 0;

  await pMap(todo, async (a) => {
    try {
      const products = await searchProducts({ query: a.name });
      let best = null;
      for (const p of products) {
        const title = p.title ?? p.productTitle ?? "";
        const score = similarity(a.name, title);
        if (score < MIN_SCORE) continue;
        if (!best || score > best.score) best = { product: p, score };
      }
      if (!best) {
        cache[a.slug] = { scrapedAt: new Date().toISOString(), match: null };
        skipped += 1;
        return;
      }
      const p = best.product;
      cache[a.slug] = {
        scrapedAt: new Date().toISOString(),
        match: {
          productCode: p.productCode,
          title: p.title ?? p.productTitle,
          url: appendPartnerParam(p.productUrl ?? p.bookingLink ?? ""),
          imageUrl: p.images?.[0]?.variants?.[0]?.url ?? null,
          fromPriceChf:
            typeof p.pricing?.summary?.fromPrice === "number"
              ? p.pricing.summary.fromPrice
              : null,
          rating:
            typeof p.reviews?.combinedAverageRating === "number"
              ? p.reviews.combinedAverageRating
              : null,
          reviewCount:
            typeof p.reviews?.totalReviews === "number"
              ? p.reviews.totalReviews
              : null,
          score: Number(best.score.toFixed(3)),
        },
      };
      matched += 1;
      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(OUT_PATH, JSON.stringify(cache, null, 2) + "\n");
    } catch (e) {
      errored += 1;
      console.warn(`  ! ${a.slug}: ${e.message}`);
    }
  });

  console.log(`fetch-viator: matched=${matched} skipped=${skipped} errored=${errored}`);
}

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
    activity.marketplaces = (activity.marketplaces ?? []).filter(
      (m) => m.partnerId !== "viator"
    );
    activity.marketplaces.push({
      partnerId: "viator",
      partnerName: "Viator",
      bookingUrl: entry.match.url,
      isDirectLink: true,
      ...(entry.match.rating != null ? { rating: entry.match.rating } : {}),
      description: `Matched on Viator (similarity ${entry.match.score}). Powered by TripAdvisor reviews.`,
    });

    if (typeof entry.match.fromPriceChf === "number" && entry.match.fromPriceChf > 0) {
      const adult = entry.match.fromPriceChf;
      const child = Math.round(adult * 0.5);
      const student = Math.round(adult * 0.85);
      const senior = Math.round(adult * 0.9);

      activity.providers = (activity.providers ?? []).filter(
        (p) => !p.bookingUrl?.includes("viator.com")
      );
      activity.providers.push({
        name: "Viator",
        pricing: { child, student, adult, senior },
        bookingUrl: entry.match.url,
        rating: entry.match.rating ?? 4.4,
        description:
          "Listed on Viator (TripAdvisor company). Mobile tickets, free cancellation on most products.",
      });
    }

    writeFileSync(path, JSON.stringify(activity, null, 2) + "\n");
    updated += 1;
  }
  console.log(`merge-viator: ${updated} activity files updated`);
}

if (MERGE) runMerge();
else
  runFetch().catch((e) => {
    console.error(e);
    process.exit(1);
  });

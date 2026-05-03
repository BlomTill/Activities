#!/usr/bin/env node
/**
 * scrape-swissactivities-prices.mjs
 *
 * Pass 2 of the SwissActivities scrape pipeline.
 *
 * For every activity in src/data/activities.ts that has a SwissActivities
 * marketplace deep link, fetch the page, extract `__NEXT_DATA__`, and pull
 * out `props.pageProps.activity.summary` — which contains the price
 * struct that pass 1 (scrape-swissactivities.mjs) couldn't read because
 * it only looked at the listing pages.
 *
 * Output:
 *   .content/swissactivities-prices.json
 *   {
 *     "<activity-slug>": {
 *       "url": "https://www.swissactivities.com/...?ref=odbhodn",
 *       "scrapedAt": "2026-…",
 *       "currency": "CHF",
 *       "minAdult": 41.0,        // best confidence
 *       "min":      0.0,         // usually infant/child rate
 *       "max":      82.0,
 *       "startingPriceType": "individual" | "group",
 *       "supplier": "Stanserhorn Bahnen",   // when available
 *       "supplierUrl": "https://www.swissactivities.com/.../supplier/..."
 *     }
 *   }
 *
 * Resumable: re-running skips slugs already in the output file.
 * Polite: ~6 concurrent requests, 600ms delay between batches.
 *
 * Usage:
 *   node scripts/scrape-swissactivities-prices.mjs
 *
 *   # Pass --force to re-fetch entries that already exist.
 *   node scripts/scrape-swissactivities-prices.mjs --force
 *
 *   # Limit how many activities to process (handy for testing).
 *   node scripts/scrape-swissactivities-prices.mjs --limit 20
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_LIST = resolve(ROOT, ".content/generated/activities.list.json");
const ACTIVITIES_FULL = resolve(ROOT, ".content/generated/activities.full.json");
const OUT_DIR = resolve(ROOT, ".content");
const OUT_FILE = resolve(OUT_DIR, "swissactivities-prices.json");

// ─── CLI args ────────────────────────────────────────────────────────────────
const FORCE = process.argv.includes("--force");
const LIMIT_IDX = process.argv.indexOf("--limit");
const LIMIT = LIMIT_IDX > -1 ? Number(process.argv[LIMIT_IDX + 1]) : Infinity;

// ─── Tunables ────────────────────────────────────────────────────────────────
const CONCURRENCY = 6;
const BATCH_DELAY_MS = 600;
const PER_REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; ExploreSwitzerland-PriceScraper/1.0; +https://realswitzerland.ch)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-CH,en;q=0.9",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function asNumber(amount) {
  if (amount == null) return null;
  const n = Number(amount);
  return Number.isFinite(n) ? n : null;
}

/**
 * Strip our affiliate ref before fetching — the page renders identically
 * but we avoid polluting analytics on SwissActivities' side and we
 * bust their CDN cache less.
 */
function cleanUrl(url) {
  try {
    const u = new URL(url);
    u.searchParams.delete("ref");
    u.searchParams.delete("es_slot");
    u.searchParams.delete("es_slug");
    return u.toString();
  } catch {
    return url;
  }
}

async function fetchHtml(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
    if (res.status === 404) return { notFound: true };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { html: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/**
 * Pull the price summary out of __NEXT_DATA__. Returns null when the page
 * isn't an activity detail page (e.g. category landing, supplier page).
 */
function extractPriceSummary(nextData) {
  const activity = nextData?.props?.pageProps?.activity;
  const summary = activity?.summary;
  if (!summary) return null;

  const minAdult =
    asNumber(summary.minAdultPrice?.amount) ?? asNumber(summary.startingPrice?.amount);
  if (minAdult == null) return null;

  return {
    currency: summary.minAdultPrice?.currency ?? summary.startingPrice?.currency ?? "CHF",
    minAdult,
    min: asNumber(summary.minPrice?.amount),
    max: asNumber(summary.maxPrice?.amount),
    startingPriceType: summary.startingPriceType ?? null,
    supplier: activity?.supplier?.name ?? null,
    supplierUrl: activity?.supplier?.url ?? null,
  };
}

async function fetchOne(url, attempt = 0) {
  try {
    const r = await fetchHtml(url);
    if (r.notFound) return { ok: false, error: "404" };
    const next = extractNextData(r.html);
    if (!next) return { ok: false, error: "no __NEXT_DATA__" };
    const summary = extractPriceSummary(next);
    if (!summary) return { ok: false, error: "no activity summary" };
    return { ok: true, summary };
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await sleep(800 * (attempt + 1));
      return fetchOne(url, attempt + 1);
    }
    return { ok: false, error: String(err?.message ?? err) };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(ACTIVITIES_FULL)) {
    console.error(
      `❌ ${ACTIVITIES_FULL} not found. Run \`npm run content:build\` first.`
    );
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  // Read ALL activities (full version has marketplaces).
  const activities = JSON.parse(readFileSync(ACTIVITIES_FULL, "utf8"));

  // Build a list of {slug, url} for everything that has a SwissActivities
  // direct deep link — we don't bother fetching search-only listings
  // (those don't resolve to a single activity page) or hand-curated
  // entries that have no SA link at all.
  const targets = [];
  for (const a of activities) {
    const sa = (a.marketplaces ?? []).find(
      (m) => m.partnerId === "swissactivities" && m.isDirectLink
    );
    if (!sa) continue;
    targets.push({ slug: a.slug, url: cleanUrl(sa.bookingUrl) });
  }

  // Resume: load any prior output and skip slugs already covered (unless --force).
  const existing = existsSync(OUT_FILE)
    ? JSON.parse(readFileSync(OUT_FILE, "utf8"))
    : {};
  const out = { ...existing };

  let pending = FORCE ? targets : targets.filter((t) => !out[t.slug]);
  if (Number.isFinite(LIMIT)) pending = pending.slice(0, LIMIT);

  console.log(
    `📋 ${activities.length} activities total, ${targets.length} have SA deep links, ${pending.length} to fetch`
  );
  if (Object.keys(out).length > 0 && !FORCE) {
    console.log(`   ↻ resuming — ${Object.keys(out).length} already cached`);
  }

  const stats = { ok: 0, skipped: 0, failed: 0 };
  const failures = [];
  let writeCounter = 0;

  // Process in batches with limited concurrency.
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ slug, url }) => {
        const r = await fetchOne(url);
        return { slug, url, ...r };
      })
    );

    for (const r of results) {
      if (r.ok) {
        out[r.slug] = {
          url: r.url,
          scrapedAt: new Date().toISOString(),
          ...r.summary,
        };
        stats.ok++;
      } else {
        stats.failed++;
        failures.push({ slug: r.slug, url: r.url, error: r.error });
      }
    }

    // Persist every 5 batches so an interrupt doesn't lose progress.
    writeCounter++;
    if (writeCounter % 5 === 0) {
      writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
    }

    process.stdout.write(
      `\r   ${i + batch.length}/${pending.length}  ok=${stats.ok}  fail=${stats.failed}   `
    );
    await sleep(BATCH_DELAY_MS);
  }

  writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log("\n");
  console.log(`✅ Wrote ${OUT_FILE}`);
  console.log(`   total cached:  ${Object.keys(out).length}`);
  console.log(`   succeeded now: ${stats.ok}`);
  console.log(`   failed now:    ${stats.failed}`);

  if (failures.length > 0) {
    console.log("\n   First 10 failures:");
    for (const f of failures.slice(0, 10)) {
      console.log(`     ${f.error.padEnd(28)} ${f.slug}`);
    }
  }
}

void ACTIVITIES_LIST; // exported only so callers can find the path
main().catch((err) => {
  console.error(err);
  process.exit(1);
});

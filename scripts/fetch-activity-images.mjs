#!/usr/bin/env node
/**
 * fetch-activity-images.mjs
 *
 * Multi-source image fetcher. For every activity it tries each source in
 * priority order and stops as soon as a good image is found:
 *
 *   1. Wikipedia/Wikimedia Commons  — exact landmark photos, CC-licensed
 *   2. Unsplash                     — keyword search, premium quality, free licence
 *   3. Pexels                       — keyword search, free licence
 *   4. Pixabay                      — keyword search, free licence, no attribution needed
 *
 * This means even activities with no Wikipedia article (escape rooms,
 * karting tracks, fondue restaurants, etc.) still get a real, relevant photo.
 *
 * ─── Setup ───────────────────────────────────────────────────────────────────
 * Create .env.local in the project root with the keys you have.
 * All sources are optional — the script skips any source whose key is missing.
 *
 *   UNSPLASH_ACCESS_KEY=...   # https://unsplash.com/developers (free)
 *   PEXELS_API_KEY=...        # https://www.pexels.com/api/    (free)
 *   PIXABAY_API_KEY=...       # https://pixabay.com/api/docs/  (free)
 *
 * Wikipedia needs no key.
 *
 * ─── Usage ───────────────────────────────────────────────────────────────────
 *   npm run fetch-images                          # fill gaps only
 *   npm run fetch-images -- --force               # re-fetch everything
 *   npm run fetch-images -- --slug=rhine-falls    # single activity
 *   npm run fetch-images -- --dry                 # preview without writing
 *   npm run fetch-images -- --source=unsplash     # force a specific source
 *
 * Requires Node 18+ (built-in fetch). Run locally — needs internet access.
 * After running, commit src/data/activity-images.json.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_PATH = resolve(ROOT, "src/data/activities.ts");
const OUT_PATH = resolve(ROOT, "src/data/activity-images.json");
const TITLES_PATH = resolve(ROOT, "src/data/wikipedia-titles.json");
const ENV_PATH = resolve(ROOT, ".env.local");

/* ─── CLI flags ─────────────────────────────────────────────────────────────── */
const FLAGS = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const SLUG_FLAG = process.argv.slice(2).find((a) => a.startsWith("--slug="));
const SOURCE_FLAG = process.argv.slice(2).find((a) => a.startsWith("--source="));
const ONLY_SLUG = SLUG_FLAG ? SLUG_FLAG.slice("--slug=".length) : null;
const ONLY_SOURCE = SOURCE_FLAG ? SOURCE_FLAG.slice("--source=".length) : null;
const FORCE = FLAGS.has("--force");
const DRY = FLAGS.has("--dry");

/* ─── Tuning ─────────────────────────────────────────────────────────────────── */
const REQUEST_TIMEOUT = 10_000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;
const POLITE_DELAY_MS = 300; // between requests to same host

/* ─── Logging ────────────────────────────────────────────────────────────────── */
const COLOR = { info: "\x1b[36m", ok: "\x1b[32m", warn: "\x1b[33m", err: "\x1b[31m", dim: "\x1b[2m" };
function log(kind, msg) {
  const c = COLOR[kind] || "";
  console.log(`${c}${kind.toUpperCase().padEnd(4)}\x1b[0m ${msg}`);
}

/* ─── .env.local loader ──────────────────────────────────────────────────────── */
function loadEnv() {
  const env = {};
  if (!existsSync(ENV_PATH)) return env;
  const lines = readFileSync(ENV_PATH, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
  return env;
}

/* ─── Activities parser ───────────────────────────────────────────────────────── */
function extractActivities(src) {
  const activities = [];
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(src)) !== null) {
    const slug = m[1];
    const windowStart = Math.max(0, m.index - 400);
    const windowEnd = Math.min(src.length, m.index + 2400);
    const scope = src.slice(windowStart, windowEnd);

    const nameMatch = /name:\s*"([^"]+)"/.exec(scope);
    const wikiMatch = /wikipediaTitle:\s*"([^"]+)"/.exec(scope);
    const cityMatch = /city:\s*"([^"]+)"/.exec(scope);
    const categoryMatch = /category:\s*"([^"]+)"/.exec(scope);
    const subcatMatch = /subcategory:\s*"([^"]+)"/.exec(scope);

    activities.push({
      slug,
      name: nameMatch ? nameMatch[1] : slug,
      wikipediaTitle: wikiMatch ? wikiMatch[1] : null,
      city: cityMatch ? cityMatch[1] : "",
      category: categoryMatch ? categoryMatch[1] : "",
      subcategory: subcatMatch ? subcatMatch[1] : "",
    });
  }
  return activities;
}

/**
 * Build ordered search queries for an activity, from most to least specific.
 * Good queries help Unsplash/Pexels/Pixabay return a truly matching photo.
 */
function buildSearchQueries(activity) {
  const name = activity.name;
  const city = activity.city;
  const queries = [];

  // Most specific: the activity name itself + Switzerland
  queries.push(`${name} Switzerland`);

  // With city for disambiguation
  if (city) queries.push(`${name} ${city}`);

  // Subcategory + city
  if (activity.subcategory && city) {
    queries.push(`${activity.subcategory} ${city} Switzerland`);
  }

  // Category + city
  if (activity.category && city) {
    queries.push(`${activity.category} ${city} Switzerland`);
  }

  // Broad fallback
  queries.push(`Switzerland ${activity.category || "tourism"}`);

  // Deduplicate
  return [...new Map(queries.map((q) => [q.toLowerCase(), q])).values()];
}

/* ─── HTTP helpers ────────────────────────────────────────────────────────────── */
async function fetchWithTimeout(url, options = {}, ms = REQUEST_TIMEOUT) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(fn, label) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt);
        log("warn", `  ${label} retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms (${e.message})`);
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─────────────────────────────────────────────────────────────────────────────
   SOURCE 1: Wikipedia / Wikimedia Commons
   Best for: named landmarks, national parks, museums, mountains, lakes
   Licence:  CC BY-SA (attribution + share-alike required)
   Key:      none
───────────────────────────────────────────────────────────────────────────── */
const WIKI_UA = "ExploreSwitzerland/1.0 (contact: blom.till@gmail.com) Node/fetch";

async function fetchWikipediaImage(title) {
  return withRetry(async () => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title.replace(/ /g, "_")
    )}`;
    const res = await fetchWithTimeout(url, { headers: { "User-Agent": WIKI_UA } });
    if (res.status === 404) throw new Error(`No Wikipedia article: "${title}"`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const imgSrc = data?.originalimage?.source || data?.thumbnail?.source;
    if (!imgSrc) throw new Error("No image in Wikipedia summary");

    // Strip size prefix from thumbnail URLs (e.g. "800px-Filename.jpg" → "Filename.jpg")
    let filename = decodeURIComponent(imgSrc.split("/").pop() || "").replace(/^\d+px-/, "");

    // Fetch licence + author via MediaWiki API
    let credit = { sourceUrl: data.content_urls?.desktop?.page };
    if (filename) {
      const info = await fetchWikiImageInfo(filename);
      if (info) {
        credit = {
          author: info.author,
          license: info.license,
          sourceUrl: info.descriptionUrl || credit.sourceUrl,
          filename,
        };
      }
    }

    return {
      src: imgSrc,
      source: "wikipedia",
      credit,
    };
  }, `wikipedia:${title}`);
}

async function fetchWikiImageInfo(filename) {
  const api =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo` +
    `&iiprop=url|extmetadata|size&titles=${encodeURIComponent("File:" + filename)}&origin=*`;
  const res = await fetchWithTimeout(api, { headers: { "User-Agent": WIKI_UA } });
  if (!res.ok) return null;
  const json = await res.json();
  const pages = json?.query?.pages;
  const info = pages ? Object.values(pages)[0]?.imageinfo?.[0] : null;
  if (!info) return null;
  const meta = info.extmetadata || {};
  return {
    url: info.url,
    license: meta.LicenseShortName?.value,
    author: (meta.Artist?.value || "").replace(/<[^>]+>/g, "").trim() || undefined,
    descriptionUrl: info.descriptionurl,
    filename,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOURCE 2: Unsplash
   Best for: lifestyle, outdoor, travel photos — extremely high quality
   Licence:  Unsplash License (free commercial, no attribution required but nice)
   Key:      UNSPLASH_ACCESS_KEY  https://unsplash.com/developers
───────────────────────────────────────────────────────────────────────────── */
async function fetchUnsplashImage(queries, apiKey) {
  for (const query of queries) {
    try {
      const url =
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
        `&per_page=3&orientation=landscape&content_filter=high&order_by=relevant`;
      const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Client-ID ${apiKey}` },
      });
      if (res.status === 401) throw new Error("Invalid Unsplash API key");
      if (res.status === 403) throw new Error("Unsplash rate limit hit");
      if (!res.ok) continue;
      const data = await res.json();
      const photo = data.results?.[0];
      if (!photo) continue;

      // Trigger the download endpoint (required by Unsplash API guidelines)
      if (photo.links?.download_location) {
        fetchWithTimeout(photo.links.download_location, {
          headers: { Authorization: `Client-ID ${apiKey}` },
        }).catch(() => {});
      }

      return {
        src: photo.urls.regular, // 1080px wide — good balance of quality vs size
        source: "unsplash",
        credit: {
          author: photo.user.name,
          license: "Unsplash License",
          sourceUrl: photo.links.html,
        },
      };
    } catch (e) {
      if (e.message.includes("Invalid") || e.message.includes("rate limit")) throw e;
      // Try next query on any other error
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOURCE 3: Pexels
   Best for: broad keyword searches, great variety
   Licence:  Pexels License (free commercial, no attribution required)
   Key:      PEXELS_API_KEY  https://www.pexels.com/api/
───────────────────────────────────────────────────────────────────────────── */
async function fetchPexelsImage(queries, apiKey) {
  for (const query of queries) {
    try {
      const url =
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}` +
        `&per_page=3&orientation=landscape`;
      const res = await fetchWithTimeout(url, {
        headers: { Authorization: apiKey },
      });
      if (res.status === 401) throw new Error("Invalid Pexels API key");
      if (!res.ok) continue;
      const data = await res.json();
      const photo = data.photos?.[0];
      if (!photo) continue;

      return {
        src: photo.src.large2x || photo.src.large || photo.src.original,
        source: "pexels",
        credit: {
          author: photo.photographer,
          license: "Pexels License",
          sourceUrl: photo.url,
        },
      };
    } catch (e) {
      if (e.message.includes("Invalid")) throw e;
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOURCE 4: Pixabay
   Best for: broad fallback, very large library
   Licence:  Pixabay Content License (free commercial, no attribution required)
   Key:      PIXABAY_API_KEY  https://pixabay.com/api/docs/
───────────────────────────────────────────────────────────────────────────── */
async function fetchPixabayImage(queries, apiKey) {
  for (const query of queries) {
    try {
      const url =
        `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}` +
        `&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal` +
        `&per_page=3&min_width=1200&safesearch=true&order=popular`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const data = await res.json();
      const hit = data.hits?.[0];
      if (!hit) continue;

      return {
        src: hit.largeImageURL || hit.webformatURL,
        source: "pixabay",
        credit: {
          author: hit.user,
          license: "Pixabay License",
          sourceUrl: `https://pixabay.com/photos/${hit.id}/`,
        },
      };
    } catch (_) {
      // Try next query
    }
  }
  return null;
}

/* ─── Main orchestrator ──────────────────────────────────────────────────────── */
async function fetchBestImage(activity, config) {
  const { unsplashKey, pexelsKey, pixabayKey, titleOverrides } = config;
  const queries = buildSearchQueries(activity);
  const wikiTitle = titleOverrides[activity.slug] || activity.wikipediaTitle;

  const sources = [];

  // Build the source list in priority order, skipping unavailable ones
  if (wikiTitle && (!ONLY_SOURCE || ONLY_SOURCE === "wikipedia")) {
    sources.push({ name: "wikipedia", fn: () => fetchWikipediaImage(wikiTitle) });
  }
  if (unsplashKey && (!ONLY_SOURCE || ONLY_SOURCE === "unsplash")) {
    sources.push({ name: "unsplash", fn: () => fetchUnsplashImage(queries, unsplashKey) });
  }
  if (pexelsKey && (!ONLY_SOURCE || ONLY_SOURCE === "pexels")) {
    sources.push({ name: "pexels", fn: () => fetchPexelsImage(queries, pexelsKey) });
  }
  if (pixabayKey && (!ONLY_SOURCE || ONLY_SOURCE === "pixabay")) {
    sources.push({ name: "pixabay", fn: () => fetchPixabayImage(queries, pixabayKey) });
  }

  if (sources.length === 0) {
    throw new Error("No sources available — add at least one API key to .env.local");
  }

  for (const { name, fn } of sources) {
    try {
      const result = await fn();
      if (result?.src) {
        return { ...result, _via: name };
      }
    } catch (e) {
      log("warn", `  [${name}] ${e.message}`);
    }
    await sleep(POLITE_DELAY_MS);
  }

  return null; // All sources exhausted
}

/* ─── Entry point ────────────────────────────────────────────────────────────── */
async function main() {
  if (!existsSync(ACTIVITIES_PATH)) {
    log("err", `Could not find ${ACTIVITIES_PATH}`);
    process.exit(1);
  }

  // Load environment
  const envFile = loadEnv();
  const config = {
    unsplashKey: process.env.UNSPLASH_ACCESS_KEY || envFile.UNSPLASH_ACCESS_KEY,
    pexelsKey: process.env.PEXELS_API_KEY || envFile.PEXELS_API_KEY,
    pixabayKey: process.env.PIXABAY_API_KEY || envFile.PIXABAY_API_KEY,
    titleOverrides: {},
  };

  // Load Wikipedia title overrides
  if (existsSync(TITLES_PATH)) {
    try {
      config.titleOverrides = JSON.parse(readFileSync(TITLES_PATH, "utf8"))?.titles || {};
      log("info", `Loaded ${Object.keys(config.titleOverrides).length} Wikipedia title overrides`);
    } catch (e) {
      log("warn", `Could not parse wikipedia-titles.json: ${e.message}`);
    }
  }

  // Print which sources are active
  const activeSources = [
    "wikipedia (no key needed)",
    config.unsplashKey && "unsplash ✓",
    config.pexelsKey && "pexels ✓",
    config.pixabayKey && "pixabay ✓",
  ].filter(Boolean);
  log("info", `Active sources: ${activeSources.join(" | ")}`);

  if (!config.unsplashKey && !config.pexelsKey && !config.pixabayKey) {
    log("warn", "No API keys found. Only Wikipedia will be used.");
    log("warn", "Add UNSPLASH_ACCESS_KEY / PEXELS_API_KEY / PIXABAY_API_KEY to .env.local");
    log("warn", "for full coverage of all 150 activities.");
  }

  // Parse activities
  const src = readFileSync(ACTIVITIES_PATH, "utf8");
  const activities = extractActivities(src);
  log("info", `Parsed ${activities.length} activities from activities.ts`);

  // Load existing JSON
  let existing = { _about: "", _version: 1, images: {} };
  if (existsSync(OUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUT_PATH, "utf8"));
      if (!existing.images) existing.images = {};
    } catch (_) {
      log("warn", "activity-images.json unreadable, starting fresh");
    }
  }

  // Filter to activities that need fetching
  const todo = activities.filter((a) => {
    if (ONLY_SLUG && a.slug !== ONLY_SLUG) return false;
    if (!FORCE && existing.images[a.slug]?.src) return false;
    return true;
  });

  log("info", `Will fetch ${todo.length} image(s)${FORCE ? " (force mode)" : ""}`);

  if (DRY) {
    todo.forEach((a) => {
      const wiki = config.titleOverrides[a.slug] || a.wikipediaTitle;
      log("dim", `  ${a.slug}${wiki ? ` ← wikipedia:"${wiki}"` : ""} | query:"${a.name} Switzerland"`);
    });
    return;
  }

  // Fetch!
  const stats = { ok: 0, fail: 0, bySource: {} };

  for (let i = 0; i < todo.length; i++) {
    const a = todo[i];
    const progress = `[${i + 1}/${todo.length}]`;
    try {
      const result = await fetchBestImage(a, config);
      if (!result) throw new Error("All sources returned no image");

      existing.images[a.slug] = {
        src: result.src,
        source: result.source,
        credit: result.credit,
      };
      stats.ok++;
      stats.bySource[result._via] = (stats.bySource[result._via] || 0) + 1;
      log("ok", `${progress} ${a.slug}  [${result._via}]`);
    } catch (e) {
      stats.fail++;
      log("err", `${progress} ${a.slug}: ${e.message}`);
    }

    // Polite delay
    if (i < todo.length - 1) await sleep(POLITE_DELAY_MS);
  }

  // Write output
  const sortedImages = Object.fromEntries(
    Object.entries(existing.images).sort(([a], [b]) => a.localeCompare(b))
  );
  const out = {
    _about:
      "Auto-populated by scripts/fetch-activity-images.mjs — run `npm run fetch-images` to refresh. Maps activity slug → resolved image + credit.",
    _version: 2,
    _lastUpdated: new Date().toISOString(),
    images: sortedImages,
  };

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");

  const total = Object.keys(sortedImages).length;
  const coverage = Math.round((total / activities.length) * 100);
  log("ok", `Wrote activity-images.json  (${stats.ok} new, ${stats.fail} failed)`);
  log("info", `Coverage: ${total}/${activities.length} activities (${coverage}%)`);

  if (Object.keys(stats.bySource).length > 0) {
    log("info", `By source: ${Object.entries(stats.bySource).map(([k, v]) => `${k}:${v}`).join("  ")}`);
  }

  if (stats.fail > 0) {
    log("warn", `${stats.fail} failed. Tips:`);
    log("warn", "  • Add more API keys to .env.local for better coverage");
    log("warn", "  • Use activity.image field for manual pinning");
    log("warn", "  • Run with --source=unsplash to force a specific source");
  }
}

main().catch((e) => {
  log("err", e.stack || e.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * fetch-activity-images.mjs
 *
 * Walks through src/data/activities.ts, finds every activity with a
 * `wikipediaTitle`, calls the Wikipedia REST API to grab a real, accurate,
 * CC-licensed photo, and writes the result to src/data/activity-images.json.
 *
 * Usage:
 *   npm run fetch-images          # only fetch activities that aren't yet resolved
 *   npm run fetch-images -- --force   # refetch everything
 *   npm run fetch-images -- --slug=jungfraujoch-top-of-europe
 *
 * Requires Node 18+ (for built-in fetch).
 *
 * No API key required. Respects Wikimedia's User-Agent policy.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_PATH = resolve(ROOT, "src/data/activities.ts");
const OUT_PATH = resolve(ROOT, "src/data/activity-images.json");
const TITLES_PATH = resolve(ROOT, "src/data/wikipedia-titles.json");

const USER_AGENT =
  "ExploreSwitzerland/1.0 (https://github.com/BlomTill/Activities; contact: blom.till@gmail.com) Node/fetch";

const FLAGS = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const SLUG_FLAG = process.argv.slice(2).find((a) => a.startsWith("--slug="));
const ONLY_SLUG = SLUG_FLAG ? SLUG_FLAG.slice("--slug=".length) : null;
const FORCE = FLAGS.has("--force");
const DRY = FLAGS.has("--dry");

/* ─────────────────────── helpers ─────────────────────── */

function log(kind, msg) {
  const c = {
    info: "\x1b[36m",
    ok: "\x1b[32m",
    warn: "\x1b[33m",
    err: "\x1b[31m",
    dim: "\x1b[2m",
  }[kind] || "";
  console.log(`${c}${kind.toUpperCase().padEnd(4)}\x1b[0m ${msg}`);
}

/**
 * Lightweight extractor for { slug, wikipediaTitle, name } tuples from
 * activities.ts. We parse source text rather than importing, so this script
 * has zero build-time dependencies.
 */
function extractActivities(src) {
  const activities = [];
  // Match `slug: "..."` and, within ~800 chars, capture optional `wikipediaTitle: "..."` and `name: "..."`
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(src)) !== null) {
    const slug = m[1];
    const windowStart = Math.max(0, m.index - 400);
    const windowEnd = Math.min(src.length, m.index + 2000);
    const scope = src.slice(windowStart, windowEnd);
    const nameMatch = /name:\s*"([^"]+)"/.exec(scope);
    const wikiMatch = /wikipediaTitle:\s*"([^"]+)"/.exec(scope);
    activities.push({
      slug,
      name: nameMatch ? nameMatch[1] : slug,
      wikipediaTitle: wikiMatch ? wikiMatch[1] : null,
    });
  }
  return activities;
}

async function fetchSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title.replace(/ /g, "_")
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function fetchImageInfo(title, filename) {
  // Use the MediaWiki API to get licensing + author + image URL in one shot.
  const api = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|size&titles=${encodeURIComponent(
    "File:" + filename
  )}&origin=*`;
  const res = await fetch(api, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const pages = json?.query?.pages;
  const first = pages ? Object.values(pages)[0] : null;
  const info = first?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata || {};
  const license = meta.LicenseShortName?.value;
  const author = (meta.Artist?.value || "").replace(/<[^>]+>/g, "").trim();
  return {
    url: info.url,
    width: info.width,
    height: info.height,
    license,
    author: author || undefined,
    descriptionUrl: info.descriptionurl,
    filename,
  };
}

/* ─────────────────────── main ─────────────────────── */

async function main() {
  if (!existsSync(ACTIVITIES_PATH)) {
    log("err", `Could not find ${ACTIVITIES_PATH}`);
    process.exit(1);
  }

  const src = readFileSync(ACTIVITIES_PATH, "utf8");
  const activities = extractActivities(src);
  log("info", `Parsed ${activities.length} activities from activities.ts`);

  // Optional external slug→title override map. Takes precedence over
  // the wikipediaTitle: "…" field inline in activities.ts, so curators
  // can maintain mappings in one tidy JSON file.
  let titleOverrides = {};
  if (existsSync(TITLES_PATH)) {
    try {
      const raw = JSON.parse(readFileSync(TITLES_PATH, "utf8"));
      titleOverrides = raw?.titles || {};
      log("info", `Loaded ${Object.keys(titleOverrides).length} Wikipedia title overrides`);
    } catch (e) {
      log("warn", `Could not parse ${TITLES_PATH}: ${e.message}`);
    }
  }
  for (const a of activities) {
    if (titleOverrides[a.slug]) {
      a.wikipediaTitle = titleOverrides[a.slug];
    }
  }

  let existing = { _about: "", _version: 1, images: {} };
  if (existsSync(OUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUT_PATH, "utf8"));
      if (!existing.images) existing.images = {};
    } catch (e) {
      log("warn", "activity-images.json unreadable, starting fresh");
    }
  }

  const todo = activities.filter((a) => {
    if (ONLY_SLUG && a.slug !== ONLY_SLUG) return false;
    if (!a.wikipediaTitle) return false;
    if (!FORCE && existing.images[a.slug]?.src) return false;
    return true;
  });

  log("info", `Will fetch ${todo.length} image(s)` + (FORCE ? " (force mode)" : ""));
  if (DRY) {
    todo.forEach((a) => log("dim", `  would fetch: ${a.slug} ← "${a.wikipediaTitle}"`));
    return;
  }

  let ok = 0;
  let fail = 0;
  for (const a of todo) {
    try {
      const summary = await fetchSummary(a.wikipediaTitle);
      // Prefer originalimage, fall back to thumbnail
      const imgSrc = summary?.originalimage?.source || summary?.thumbnail?.source;
      if (!imgSrc) throw new Error("No image in summary");

      // Derive filename from the URL (…/commons/…/<hash>/<hash>/<Filename>)
      let filename = decodeURIComponent(imgSrc.split("/").pop() || "");
      // The originalimage URL contains the full-size filename; thumbnail URLs
      // have a prefix like "800px-Filename.jpg" we need to strip.
      filename = filename.replace(/^\d+px-/, "");

      const info = filename ? await fetchImageInfo(a.wikipediaTitle, filename) : null;

      existing.images[a.slug] = {
        src: imgSrc,
        credit: {
          author: info?.author,
          license: info?.license,
          sourceUrl: info?.descriptionUrl || summary.content_urls?.desktop?.page,
          filename,
        },
      };
      ok++;
      log("ok", `${a.slug} ← ${filename}${info?.license ? ` (${info.license})` : ""}`);

      // Be polite: ~300ms between requests
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      fail++;
      log("err", `${a.slug}: ${e.message}`);
    }
  }

  // Sort keys alphabetically for clean diffs
  const sortedImages = Object.fromEntries(
    Object.entries(existing.images).sort(([a], [b]) => a.localeCompare(b))
  );
  const out = {
    _about:
      "Auto-populated by scripts/fetch-activity-images.mjs. DO NOT edit by hand — run `npm run fetch-images` instead. Maps activity slug → resolved image + credit.",
    _version: 1,
    _lastUpdated: new Date().toISOString(),
    images: sortedImages,
  };

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  log("ok", `Wrote ${OUT_PATH}  (success: ${ok}, failed: ${fail})`);
}

main().catch((e) => {
  log("err", e.stack || e.message);
  process.exit(1);
});

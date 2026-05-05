#!/usr/bin/env node
/**
 * verify-activity-images.mjs
 *
 * For each activity in `content/activities/*.json`, ask a vision model
 * "does this image plausibly depict [name] in [city]?" Stamp the result
 * onto the activity:
 *
 *   imageVerified: true | false | "manual"
 *   imageSource:   "operator" | "marketplace" | "wikipedia" | "unsplash"
 *
 * Why:
 *  - The same generic Unsplash photo currently shows up on 100+ unrelated
 *    activities. A single mismatched hero on a high-traffic page tanks
 *    affiliate trust faster than any other defect.
 *  - Vision-checking once + caching is far cheaper than re-licensing
 *    photos manually.
 *
 * Two modes:
 *
 *   node scripts/verify-activity-images.mjs            # check, write cache
 *   node scripts/verify-activity-images.mjs --apply    # write `imageVerified` into JSON
 *
 * Cache file: .content/image-verification.json
 *   { "<slug>": { "checkedAt", "score": 0..1, "verdict": "match"|"mismatch"|"uncertain", "reason": "...", "imageUrl": "..." } }
 *
 * Re-running skips entries already in the cache unless --force.
 *
 * ─────────────────────────────────────────────────────────────────────
 *  PREREQUISITES
 * ─────────────────────────────────────────────────────────────────────
 *
 * Set ANTHROPIC_API_KEY in .env.local. Cost estimate (Claude Haiku 4.5,
 * vision): ~$0.003 per image. 1,500 activities ≈ $4.50 one-off.
 *
 * Flags:
 *   --limit 50          # only N activities (testing)
 *   --force             # re-check entries already cached
 *   --threshold 0.7     # match score below which `imageVerified` becomes false (default 0.7)
 *   --model claude-haiku-4-5-20251001  # override model
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_DIR = resolve(ROOT, "content/activities");
const OUT_DIR = resolve(ROOT, ".content");
const OUT_PATH = resolve(OUT_DIR, "image-verification.json");

const FLAGS = process.argv.slice(2);
const APPLY = FLAGS.includes("--apply");
const FORCE = FLAGS.includes("--force");
const LIMIT = (() => {
  const i = FLAGS.indexOf("--limit");
  return i >= 0 ? Number(FLAGS[i + 1]) : Infinity;
})();
const THRESHOLD = (() => {
  const i = FLAGS.indexOf("--threshold");
  return i >= 0 ? Number(FLAGS[i + 1]) : 0.7;
})();
const MODEL = (() => {
  const i = FLAGS.indexOf("--model");
  return i >= 0 ? FLAGS[i + 1] : "claude-haiku-4-5-20251001";
})();

const API_KEY = process.env.ANTHROPIC_API_KEY?.trim();
function requireApiKey() {
  if (!API_KEY) {
    console.error(
      "ERROR: ANTHROPIC_API_KEY missing.\n" +
        "  Add it to .env.local (https://console.anthropic.com → API keys), then re-run."
    );
    process.exit(1);
  }
}

const SYSTEM = `You are an image verifier for a Switzerland travel comparison website. The site earns affiliate revenue, so a mismatched hero photo is a credibility-killer.

Given an image and an activity description, decide whether the image plausibly depicts that activity. Be strict: a generic Alps panorama is NOT a match for "Glacier 3000 cable car" — it must show what the activity actually delivers (the cable car, the glacier hike, the specific landmark).

Reply with EXACTLY this JSON, no prose:

{"score": <number 0..1>, "verdict": "match"|"mismatch"|"uncertain", "reason": "<≤120 chars>"}

- 0.9–1.0 → clearly the activity's subject
- 0.7–0.89 → likely the right place/category but generic
- 0.5–0.69 → adjacent (same region, wrong subject) → "uncertain"
- 0.0–0.49 → unrelated → "mismatch"`;

async function verifyOne({ name, subcategory, city, imageUrl }) {
  const userText = [
    `Activity: ${name}`,
    subcategory ? `Category: ${subcategory}` : "",
    city ? `Location: ${city}, Switzerland` : "",
    "",
    "Does the image depict this activity? Reply with the JSON only.",
  ].filter(Boolean).join("\n");

  const body = {
    model: MODEL,
    max_tokens: 200,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: userText },
        ],
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const json = await res.json();
  const text =
    json.content?.find((c) => c.type === "text")?.text ?? "";

  // Forgiving JSON parse — model may wrap in ```json fences.
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { score: 0, verdict: "uncertain", reason: "could not parse model output" };
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { score: 0, verdict: "uncertain", reason: "invalid json from model" };
  }
}

function inferImageSource(activity) {
  const url = activity.image ?? activity.imageUrl ?? "";
  if (!url) return null;
  if (/wikipedia|wikimedia/i.test(url)) return "wikipedia";
  if (/unsplash/i.test(url)) return "unsplash";
  if (/swissactivities|getyourguide|viator|musement|civitatis|klook/i.test(url)) {
    return "marketplace";
  }
  return "operator";
}

async function pMap(items, fn, { concurrency = 3, batchDelayMs = 1200 } = {}) {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.allSettled(batch.map((it) => fn(it)));
    if (i + concurrency < items.length) await new Promise((r) => setTimeout(r, batchDelayMs));
  }
}

async function runCheck() {
  requireApiKey();

  const cache = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH, "utf8")) : {};

  const files = readdirSync(ACTIVITIES_DIR).filter((f) => f.endsWith(".json"));
  const todo = [];
  for (const file of files) {
    const a = JSON.parse(readFileSync(resolve(ACTIVITIES_DIR, file), "utf8"));
    if (!FORCE && cache[a.slug]) continue;
    if (a.imageVerified === "manual") continue;
    const url = a.image ?? a.imageUrl;
    if (!url) continue;
    todo.push(a);
    if (todo.length >= LIMIT) break;
  }

  console.log(`verify-images: ${todo.length} activities to check (cache hits: ${Object.keys(cache).length})`);

  let matches = 0, mismatches = 0, uncertain = 0, errored = 0;

  await pMap(todo, async (a) => {
    const url = a.image ?? a.imageUrl;
    try {
      const r = await verifyOne({
        name: a.name,
        subcategory: a.subcategory,
        city: a.location?.city,
        imageUrl: url,
      });
      cache[a.slug] = {
        checkedAt: new Date().toISOString(),
        score: typeof r.score === "number" ? r.score : 0,
        verdict: r.verdict ?? "uncertain",
        reason: r.reason ?? "",
        imageUrl: url,
        imageSource: inferImageSource(a),
        model: MODEL,
      };
      if (r.verdict === "match") matches += 1;
      else if (r.verdict === "mismatch") mismatches += 1;
      else uncertain += 1;

      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(OUT_PATH, JSON.stringify(cache, null, 2) + "\n");
    } catch (e) {
      errored += 1;
      console.warn(`  ! ${a.slug}: ${e.message}`);
    }
  });

  console.log(
    `verify-images: matches=${matches} mismatches=${mismatches} uncertain=${uncertain} errored=${errored}`
  );
}

function runApply() {
  if (!existsSync(OUT_PATH)) {
    console.error(`No cache at ${OUT_PATH}. Run without --apply first.`);
    process.exit(1);
  }
  const cache = JSON.parse(readFileSync(OUT_PATH, "utf8"));

  let applied = 0, quarantinedForImage = 0;
  for (const slug of Object.keys(cache)) {
    const path = resolve(ACTIVITIES_DIR, `${slug}.json`);
    if (!existsSync(path)) continue;
    const a = JSON.parse(readFileSync(path, "utf8"));
    if (a.imageVerified === "manual") continue;

    const c = cache[slug];
    a.imageVerified = c.score >= THRESHOLD;
    if (c.imageSource) a.imageSource = c.imageSource;

    // If the image fails, also quarantine the activity. Better to ship
    // 50 perfect pages than 1,500 with broken hero photos.
    if (!a.imageVerified) {
      a.published = false;
      quarantinedForImage += 1;
    }

    writeFileSync(path, JSON.stringify(a, null, 2) + "\n");
    applied += 1;
  }
  console.log(`apply-image-verification: ${applied} activities updated, ${quarantinedForImage} newly quarantined for image`);
  console.log("Run `npm run content:build` then `npm run content:check` to validate.");
}

if (APPLY) runApply();
else
  runCheck().catch((e) => {
    console.error(e);
    process.exit(1);
  });

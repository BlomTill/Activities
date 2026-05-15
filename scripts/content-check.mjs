#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/**
 * Content quality gate.
 *
 * Beyond schema validation, this enforces two profit-critical rules:
 *
 *  1. COMPARISON RULE — every activity must offer a real comparison.
 *     If an activity has fewer than two total provider+marketplace
 *     listings, we auto-set `published: false` (quarantine) so the index
 *     pages, sitemap, and internal links don't surface it. The activity
 *     stays in the dataset so deep links keep working and re-scrapes can
 *     promote it back when more providers appear.
 *
 *  2. UNIQUE-IMAGE RULE — no two PUBLISHED activities may share the same
 *     resolved hero image. The same generic Unsplash photo on multiple
 *     pages destroys credibility — once a user notices, they assume the
 *     entire site is auto-generated and bounce.
 *
 * Run with `--write` to persist quarantine flags back to the JSON files.
 * Without `--write` it just reports counts (used in CI to fail loudly
 * when the bar regresses).
 */
const FLAGS = new Set(process.argv.slice(2));
const WRITE_QUARANTINE = FLAGS.has("--write");
/**
 * `--launch-fifty` (or env LAUNCH_FIFTY=1) restricts publication to the
 * curated allow-list in `src/data/launch-fifty.ts`. Anything outside that
 * list is force-quarantined regardless of listing count. Use this for the
 * initial public launch so we ship 50 polished pages instead of 1,500
 * thin ones — depth beats breadth for SEO.
 */
const LAUNCH_FIFTY_MODE = FLAGS.has("--launch-fifty") || process.env.LAUNCH_FIFTY === "1";
/**
 * `--mvp` (or env MVP=1) — Phase 1 publish gate. Only the ~200 activities in
 * src/data/mvp-slugs.json stay published; everything else is force-quarantined.
 * Supersedes --launch-fifty for the MVP launch (the mvp set IS the curated
 * allow-list). check:release runs in this mode.
 */
const MVP_MODE = FLAGS.has("--mvp") || process.env.MVP === "1";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT_DIR = resolve(ROOT, "content");
const SLUG_ALIASES_PATH = resolve(CONTENT_DIR, "activity-slug-aliases.json");

/** Load the MVP allow-list (slug set) from src/data/mvp-slugs.json. */
function loadMvpSlugs() {
  const parsed = JSON.parse(readFileSync(resolve(ROOT, "src/data/mvp-slugs.json"), "utf8"));
  const slugs = parsed.slugs ?? [];
  if (slugs.length === 0) throw new Error("mvp-slugs.json has an empty `slugs` list");
  return new Set(slugs);
}

/**
 * Resolved hero image, mirroring src/lib/images.ts priority:
 *   activity.image > activity-images.json > activity-images-swissactivities.json
 *   > activity.imageUrl > category fallback.
 * The unique-image rule must check what the USER actually sees, not just the
 * raw imageUrl (which is a shared generic Unsplash placeholder on ~1,300
 * activities). MVP activities were selected for a confirmed per-activity SA/
 * curated photo, so resolved images are unique among them.
 */
const CURATED_IMAGES = (() => {
  try { return JSON.parse(readFileSync(resolve(ROOT, "src/data/activity-images.json"), "utf8")).images ?? {}; }
  catch { return {}; }
})();
const SA_IMAGES = (() => {
  try { return JSON.parse(readFileSync(resolve(ROOT, "src/data/activity-images-swissactivities.json"), "utf8")).images ?? {}; }
  catch { return {}; }
})();
function resolvedHeroImage(a) {
  if (a.image) return a.image;
  if (CURATED_IMAGES[a.slug]?.src) return CURATED_IMAGES[a.slug].src;
  if (SA_IMAGES[a.slug]?.src) return SA_IMAGES[a.slug].src;
  if (a.imageUrl) return a.imageUrl;
  return `category-fallback:${a.category}`;
}

/**
 * Load the launch-fifty allow-list from src/data/launch-fifty.ts at runtime.
 * We parse the TS file with a tiny regex instead of importing it (Node ESM
 * doesn't load .ts directly, and we don't want to add a build-step dep
 * just for this script). The allow-list is plain string literals so this
 * is robust enough.
 */
function loadLaunchFifty() {
  const path = resolve(ROOT, "src/data/launch-fifty.ts");
  const src = readFileSync(path, "utf8");
  // Match: `LAUNCH_FIFTY_SLUGS<...>= [ ...slugs... ];`
  // The `=\s*\[` anchor is essential — `string[]` in the type annotation
  // also contains `[` and `]`, so we must scan past the assignment to find
  // the *array literal*.
  const match = src.match(/LAUNCH_FIFTY_SLUGS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error("Could not parse LAUNCH_FIFTY_SLUGS from launch-fifty.ts");
  const slugs = [...match[1].matchAll(/"([a-z0-9][a-z0-9-]*)"/g)].map((m) => m[1]);
  if (slugs.length === 0) throw new Error("Parsed empty LAUNCH_FIFTY_SLUGS list");
  return new Set(slugs);
}

const activitySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  longDescription: z.string().min(1),
  category: z.enum(["outdoor", "culture", "adventure", "family", "wellness"]),
  subcategory: z.string().min(1),
  location: z.object({
    region: z.string().min(1),
    // canton may be empty for SwissActivities-imported activities — the
    // scraper only captures it for ~150 of the 1,500 entries.
    canton: z.string(),
    city: z.string().min(1),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
  }),
  seasons: z.array(z.enum(["spring", "summer", "autumn", "winter"])) ,
  indoor: z.boolean(),
  // Providers list priced suppliers. May be empty when the activity is
  // sold only through marketplace aggregators — in that case
  // `marketplaces` carries the booking links instead.
  providers: z.array(
    z.object({
      name: z.string().min(1),
      pricing: z.object({ child: z.number(), student: z.number(), adult: z.number(), senior: z.number() }),
      bookingUrl: z.string().url(),
      rating: z.number(),
      description: z.string().optional(),
    })
  ),
  marketplaces: z.array(
    z.object({
      partnerId: z.string().min(1),
      partnerName: z.string().min(1),
      bookingUrl: z.string().url(),
      isDirectLink: z.boolean(),
      rating: z.number().optional(),
      description: z.string().optional(),
    })
  ).optional(),
  currency: z.literal("CHF"),
  duration: z.string().min(1),
  // imageUrl is optional — most activities resolve their hero photo at
  // runtime via src/data/activity-images.json or the category fallback.
  // The unique-image CI check below still enforces no two PUBLISHED
  // activities share the same explicitly-set image URL.
  imageUrl: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  // Imported activities may have empty tag arrays — the scraper only
  // tags entries that match a hardcoded keyword list.
  tags: z.array(z.string()),
  featured: z.boolean(),
  gallery: z.array(z.string()).optional(),
  highlights: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  deal: z
    .object({
      discount: z.number(),
      label: z.string(),
      validUntil: z.string(),
      providerName: z.string().optional(),
    })
    .optional(),
  published: z.boolean().optional(),
  imageVerified: z.union([z.boolean(), z.literal("manual")]).optional(),
  imageSource: z.enum(["operator", "marketplace", "wikipedia", "unsplash", "manual"]).optional(),
}).refine(
  (a) => (a.providers?.length ?? 0) > 0 || (a.marketplaces?.length ?? 0) > 0,
  { message: "Activity must have at least one provider or marketplace listing", path: ["providers"] },
);

const storySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  date: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string()).min(1),
  content: z.string().min(1),
});

const itinerarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  days: z.number().int().positive(),
  difficulty: z.enum(["Easy", "Moderate", "Active"]),
  bestSeason: z.string().min(1),
  estimatedBudget: z.object({ budget: z.string(), mid: z.string(), luxury: z.string() }),
  coverImage: z.string().min(1),
  regions: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
  featured: z.boolean(),
  itinerary: z.array(
    z.object({
      day: z.number().int().positive(),
      title: z.string().min(1),
      location: z.string().min(1),
      description: z.string().min(1),
      activitySlugs: z.array(z.string().min(1)),
      transport: z.string().optional(),
      tip: z.string().optional(),
    })
  ).min(1),
});

function readJsonDir(subDir) {
  const dir = resolve(CONTENT_DIR, subDir);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((file) => JSON.parse(readFileSync(resolve(dir, file), "utf8")));
}

function assertUnique(entries, key, label) {
  const seen = new Set();
  for (const entry of entries) {
    const value = entry[key];
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${String(value)}`);
    seen.add(value);
  }
}

/** Total number of bookable rows = priced providers + marketplace listings. */
function listingCount(activity) {
  return (activity.providers?.length ?? 0) + (activity.marketplaces?.length ?? 0);
}

/**
 * Apply the COMPARISON RULE: any activity with fewer than 2 total listings
 * gets `published: false`. Returns { quarantined, promoted } counts.
 *
 * When --write is passed, persists the change back to disk so the next
 * `content:build` run picks it up. Otherwise just reports.
 */
function enforceComparisonRule(activities) {
  let quarantined = 0;
  let promoted = 0;
  const COMPARE_DIR = resolve(CONTENT_DIR, "activities");
  // MVP mode supersedes launch-fifty: the 200-slug allow-list is the gate.
  const allowList = MVP_MODE ? loadMvpSlugs() : LAUNCH_FIFTY_MODE ? loadLaunchFifty() : null;

  for (const a of activities) {
    // In launch-fifty mode, any activity not on the allow-list is quarantined,
    // regardless of how many listings it has. Allow-list entries need ≥1
    // static listing — the rest of the comparison is provided at runtime by
    // src/lib/live-prices.ts via partner APIs (GetYourGuide, Viator, Klook),
    // so we don't require 2 static rows the way we do outside this mode.
    const onAllowList = allowList ? allowList.has(a.slug) : true;
    const minListings = allowList ? 1 : 2;
    const meets = listingCount(a) >= minListings && onAllowList;
    const wasPublished = a.published !== false;

    if (!meets && wasPublished) {
      a.published = false;
      quarantined += 1;
      if (WRITE_QUARANTINE) {
        writeFileSync(
          resolve(COMPARE_DIR, `${a.slug}.json`),
          JSON.stringify(a, null, 2) + "\n"
        );
      }
    } else if (meets && a.published === false) {
      // Auto-promote: an activity that picked up a 2nd provider is no longer
      // quarantined. We only promote when the curator hasn't manually pinned
      // `published: false`; for a manual override, set `published: false`
      // *and* add `_pinned: true` (handled by skipping when _pinned exists).
      if (!a._pinned) {
        delete a.published;
        promoted += 1;
        if (WRITE_QUARANTINE) {
          writeFileSync(
            resolve(COMPARE_DIR, `${a.slug}.json`),
            JSON.stringify(a, null, 2) + "\n"
          );
        }
      }
    }
  }
  return { quarantined, promoted };
}

/**
 * Apply the UNIQUE-IMAGE RULE among published activities. Throws if any
 * two published entries share the same resolved hero URL.
 *
 * Resolution mirrors src/lib/images.ts priority: explicit `image` > `imageUrl`.
 */
function assertUniqueImagesAmongPublished(activities) {
  const seen = new Map(); // url -> first slug
  const collisions = [];

  for (const a of activities) {
    if (a.published === false) continue;
    // Check the RESOLVED hero (what the user actually sees), not the raw
    // imageUrl — see resolvedHeroImage(). Category-fallback collisions are
    // ignored (they're an accepted generic, not a credibility-killing
    // "same photo on two specific activities").
    const url = resolvedHeroImage(a);
    if (!url || url.startsWith("category-fallback:")) continue;
    const prev = seen.get(url);
    if (prev) {
      collisions.push({ url, slugs: [prev, a.slug] });
    } else {
      seen.set(url, a.slug);
    }
  }

  if (collisions.length > 0) {
    const sample = collisions.slice(0, 5)
      .map((c) => `  ${c.url}\n    used by: ${c.slugs.join(", ")}`)
      .join("\n");
    const allow = process.env.ALLOW_DUPLICATE_IMAGES === "1";
    const msg = `Duplicate hero images among PUBLISHED activities: ${collisions.length} collision(s)\n${sample}${
      collisions.length > 5 ? `\n  …and ${collisions.length - 5} more` : ""
    }`;
    if (allow) {
      console.warn(`[content:check] WARNING (suppressed by ALLOW_DUPLICATE_IMAGES=1):\n${msg}`);
    } else {
      throw new Error(msg);
    }
  }
}

function main() {
  const started = Date.now();

  const activities = readJsonDir("activities").map((entry) => activitySchema.parse(entry));
  const stories = readJsonDir("stories").map((entry) => storySchema.parse(entry));
  const itineraries = readJsonDir("itineraries").map((entry) => itinerarySchema.parse(entry));
  const slugAliases = JSON.parse(readFileSync(SLUG_ALIASES_PATH, "utf8"));

  assertUnique(activities, "id", "activity id");
  assertUnique(activities, "slug", "activity slug");
  assertUnique(stories, "slug", "story slug");
  assertUnique(itineraries, "id", "itinerary id");
  assertUnique(itineraries, "slug", "itinerary slug");

  const { quarantined, promoted } = enforceComparisonRule(activities);

  // Itinerary integrity must include quarantined activities — a quarantined
  // entry shouldn't break a story's day-plan link, it should just be hidden
  // from index/sitemap.
  const activitySlugs = new Set(activities.map((a) => a.slug));
  for (const itinerary of itineraries) {
    for (const day of itinerary.itinerary) {
      for (const activitySlug of day.activitySlugs) {
        if (!activitySlugs.has(activitySlug)) {
          const resolved = slugAliases[activitySlug];
          if (!resolved || !activitySlugs.has(resolved)) {
            throw new Error(`Broken itinerary activity link: ${itinerary.slug} -> ${activitySlug}`);
          }
        }
      }
    }
  }

  assertUniqueImagesAmongPublished(activities);

  const publishedCount = activities.filter((a) => a.published !== false).length;

  const elapsedMs = Date.now() - started;
  const budgetMs = Number(process.env.CONTENT_CHECK_MAX_MS ?? "10000");
  if (elapsedMs > budgetMs) {
    throw new Error(`content:check exceeded budget (${elapsedMs}ms > ${budgetMs}ms)`);
  }

  console.log("content:check ok", {
    activities: activities.length,
    activitiesPublished: publishedCount,
    activitiesQuarantined: activities.length - publishedCount,
    quarantinedThisRun: quarantined,
    promotedThisRun: promoted,
    writeMode: WRITE_QUARANTINE,
    stories: stories.length,
    itineraries: itineraries.length,
    elapsedMs,
  });
}

main();

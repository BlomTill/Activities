#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT_DIR = resolve(ROOT, "content");
const SLUG_ALIASES_PATH = resolve(CONTENT_DIR, "activity-slug-aliases.json");

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
  imageUrl: z.string().min(1),
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

  const elapsedMs = Date.now() - started;
  const budgetMs = Number(process.env.CONTENT_CHECK_MAX_MS ?? "5000");
  if (elapsedMs > budgetMs) {
    throw new Error(`content:check exceeded budget (${elapsedMs}ms > ${budgetMs}ms)`);
  }

  console.log("content:check ok", {
    activities: activities.length,
    stories: stories.length,
    itineraries: itineraries.length,
    elapsedMs,
  });
}

main();

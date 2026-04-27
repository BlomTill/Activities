#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "src/data");
const CONTENT_DIR = resolve(ROOT, "content");
const GENERATED_DIR = resolve(ROOT, ".content/generated");
const SLUG_ALIASES_PATH = resolve(CONTENT_DIR, "activity-slug-aliases.json");

function extractArrayLiteral(source, exportName) {
  const marker = `export const ${exportName}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Could not find export: ${exportName}`);

  const equalsIdx = source.indexOf("=", start);
  if (equalsIdx < 0) throw new Error(`Could not find assignment for: ${exportName}`);

  let i = source.indexOf("[", equalsIdx);
  if (i < 0) throw new Error(`Could not find array start for: ${exportName}`);

  let depth = 0;
  let state = "code"; // code | single | double | template | lineComment | blockComment
  let prev = "";
  const begin = i;

  for (; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1] ?? "";

    if (state === "lineComment") {
      if (ch === "\n") state = "code";
      prev = ch;
      continue;
    }
    if (state === "blockComment") {
      if (prev === "*" && ch === "/") state = "code";
      prev = ch;
      continue;
    }
    if (state === "single") {
      if (ch === "'" && prev !== "\\") state = "code";
      prev = ch;
      continue;
    }
    if (state === "double") {
      if (ch === '"' && prev !== "\\") state = "code";
      prev = ch;
      continue;
    }
    if (state === "template") {
      if (ch === "`" && prev !== "\\") state = "code";
      prev = ch;
      continue;
    }

    if (ch === "/" && next === "/") {
      state = "lineComment";
      prev = ch;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      state = "blockComment";
      prev = ch;
      i++;
      continue;
    }

    if (ch === "'") {
      state = "single";
      prev = ch;
      continue;
    }
    if (ch === '"') {
      state = "double";
      prev = ch;
      continue;
    }
    if (ch === "`") {
      state = "template";
      prev = ch;
      continue;
    }

    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(begin, i + 1);
      }
    }

    prev = ch;
  }

  throw new Error(`Unterminated array literal for export: ${exportName}`);
}

function parseExportedArray(filePath, exportName) {
  const src = readFileSync(filePath, "utf8");
  const literal = extractArrayLiteral(src, exportName);
  return vm.runInNewContext(`(${literal})`, {}, { timeout: 30_000 });
}

function safeRecreate(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}

function normalizeSlugMap(entries) {
  const out = {};
  for (const entry of entries) out[entry.slug] = entry;
  return out;
}

function buildListActivities(activities) {
  return activities.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.description,
    category: a.category,
    subcategory: a.subcategory,
    location: a.location,
    seasons: a.seasons,
    indoor: a.indoor,
    imageUrl: a.imageUrl,
    featured: Boolean(a.featured),
    providerCount: a.providers?.length ?? 0,
    minAdultPrice:
      Array.isArray(a.providers) && a.providers.length > 0
        ? Math.min(...a.providers.map((p) => Number(p?.pricing?.adult ?? 0)))
        : 0,
  }));
}

function buildListStories(posts) {
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    author: p.author,
    tags: p.tags,
  }));
}

function buildListItineraries(itineraries) {
  return itineraries.map((i) => ({
    id: i.id,
    slug: i.slug,
    title: i.title,
    subtitle: i.subtitle,
    description: i.description,
    duration: i.duration,
    days: i.days,
    difficulty: i.difficulty,
    bestSeason: i.bestSeason,
    coverImage: i.coverImage,
    regions: i.regions,
    tags: i.tags,
    featured: Boolean(i.featured),
    estimatedBudget: i.estimatedBudget,
  }));
}

function writeContentFiles(subDir, entries) {
  const dir = resolve(CONTENT_DIR, subDir);
  safeRecreate(dir);
  for (const entry of entries) {
    writeJson(resolve(dir, `${entry.slug}.json`), entry);
  }
}

function main() {
  const activities = parseExportedArray(resolve(DATA_DIR, "activities.ts"), "activities");
  const stories = parseExportedArray(resolve(DATA_DIR, "blog-posts.ts"), "blogPosts");
  const itineraries = parseExportedArray(resolve(DATA_DIR, "itineraries.ts"), "itineraries");
  const slugAliases = JSON.parse(readFileSync(SLUG_ALIASES_PATH, "utf8"));

  safeRecreate(GENERATED_DIR);

  writeContentFiles("activities", activities);
  writeContentFiles("stories", stories);
  writeContentFiles("itineraries", itineraries);

  const activitiesList = buildListActivities(activities);
  const storiesList = buildListStories(stories);
  const itinerariesList = buildListItineraries(itineraries);

  writeJson(resolve(GENERATED_DIR, "activities.full.json"), activities);
  writeJson(resolve(GENERATED_DIR, "activities.list.json"), activitiesList);
  writeJson(resolve(GENERATED_DIR, "activities.by-slug.json"), normalizeSlugMap(activities));
  writeJson(resolve(GENERATED_DIR, "activities.slug-aliases.json"), slugAliases);

  writeJson(resolve(GENERATED_DIR, "stories.full.json"), stories);
  writeJson(resolve(GENERATED_DIR, "stories.list.json"), storiesList);
  writeJson(resolve(GENERATED_DIR, "stories.by-slug.json"), normalizeSlugMap(stories));

  writeJson(resolve(GENERATED_DIR, "itineraries.full.json"), itineraries);
  writeJson(resolve(GENERATED_DIR, "itineraries.list.json"), itinerariesList);
  writeJson(resolve(GENERATED_DIR, "itineraries.by-slug.json"), normalizeSlugMap(itineraries));

  writeJson(resolve(GENERATED_DIR, "manifest.json"), {
    generatedAt: new Date().toISOString(),
    counts: {
      activities: activities.length,
      stories: stories.length,
      itineraries: itineraries.length,
    },
  });

  const contentCounts = {
    activities: readdirSync(resolve(CONTENT_DIR, "activities")).length,
    stories: readdirSync(resolve(CONTENT_DIR, "stories")).length,
    itineraries: readdirSync(resolve(CONTENT_DIR, "itineraries")).length,
  };

  console.log("content:build complete", contentCounts);
}

main();

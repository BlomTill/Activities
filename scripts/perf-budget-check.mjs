#!/usr/bin/env node
import { statSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const GENERATED = resolve(ROOT, ".content/generated");

function size(path) {
  return statSync(path).size;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const limits = {
  activitiesListBytes: Number(process.env.BUDGET_ACTIVITIES_LIST_BYTES ?? 350_000),
  activitiesFullBytes: Number(process.env.BUDGET_ACTIVITIES_FULL_BYTES ?? 1_200_000),
  storiesFullBytes: Number(process.env.BUDGET_STORIES_FULL_BYTES ?? 800_000),
};

const files = {
  manifest: resolve(GENERATED, "manifest.json"),
  activitiesList: resolve(GENERATED, "activities.list.json"),
  activitiesFull: resolve(GENERATED, "activities.full.json"),
  storiesFull: resolve(GENERATED, "stories.full.json"),
};

for (const [label, file] of Object.entries(files)) {
  assert(existsSync(file), `Missing generated file: ${label} (${file})`);
}

const manifest = JSON.parse(readFileSync(files.manifest, "utf8"));
assert(manifest?.counts?.activities > 0, "No activities in generated manifest");
assert(manifest?.counts?.stories > 0, "No stories in generated manifest");
assert(manifest?.counts?.itineraries > 0, "No itineraries in generated manifest");

const metrics = {
  activitiesListBytes: size(files.activitiesList),
  activitiesFullBytes: size(files.activitiesFull),
  storiesFullBytes: size(files.storiesFull),
};

assert(
  metrics.activitiesListBytes <= limits.activitiesListBytes,
  `activities.list.json exceeds budget (${metrics.activitiesListBytes} > ${limits.activitiesListBytes})`
);
assert(
  metrics.activitiesFullBytes <= limits.activitiesFullBytes,
  `activities.full.json exceeds budget (${metrics.activitiesFullBytes} > ${limits.activitiesFullBytes})`
);
assert(
  metrics.storiesFullBytes <= limits.storiesFullBytes,
  `stories.full.json exceeds budget (${metrics.storiesFullBytes} > ${limits.storiesFullBytes})`
);

console.log("perf:check ok", { limits, metrics });

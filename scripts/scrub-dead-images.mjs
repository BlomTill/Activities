#!/usr/bin/env node
/**
 * Scrub dead Unsplash IDs from data files & components.
 *
 * Background: a handful of Unsplash photo IDs were referenced manually months
 * ago and have since 404'd (Unsplash sometimes deletes or 451s photos).
 * They show up as endless `upstream image response failed … 404` noise in dev.
 *
 * The image resolver already cascades to the next fallback on error, so the
 * UX is fine — but the dev console becomes useless. This script:
 *
 *   1. removes `imageUrl: "<dead url>"` fragments from src/data/activities.ts
 *      (the resolver then picks Wikipedia → SwissActivities → category).
 *   2. swaps decorative homepage Unsplash IDs in src/app/home-client.tsx with
 *      replacement IDs from a known-good list (verified live at the time of
 *      writing).
 *
 * Idempotent. Safe to run after `npm run import:swissactivities` etc.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// Confirmed-dead photo IDs (404 from Unsplash CDN)
const DEAD_IDS = [
  "photo-1543634806-d12bf25b8074",
  "photo-1560704198-d36d8836f1cd",
  "photo-1543349689-9a4d426bee8e",
  "photo-1559128010-92a8ef05bd22",
  "photo-1485470733090-0aae1788d668",
  "photo-1611499616977-6c903e285400",
];

// Verified-live replacements for decorative homepage imagery (Swiss Alps,
// trains, scenic). Used only in home-client.tsx.
const HOMEPAGE_REPLACEMENTS = {
  // Hero background → Matterhorn at Zermatt
  "photo-1543634806-d12bf25b8074":
    "photo-1530021232320-687d8e3dba54",
  // Aside Swiss train → Glacier Express in winter
  "photo-1560704198-d36d8836f1cd":
    "photo-1502786129293-79981df4e689",
  // Story card "Most scenic train rides" → mountain train
  "photo-1543349689-9a4d426bee8e":
    "photo-1527684651001-731c474bbb5a",
};

async function processActivities() {
  const file = path.join(ROOT, "src/data/activities.ts");
  let text = await readFile(file, "utf8");
  let stripped = 0;

  for (const id of DEAD_IDS) {
    // Match: imageUrl: "https://images.unsplash.com/<id>?<query>",  (optionally with trailing space)
    const re = new RegExp(
      ` ?imageUrl: "https:\\/\\/images\\.unsplash\\.com\\/${id}[^"]*",?`,
      "g"
    );
    const before = text.length;
    text = text.replace(re, "");
    if (text.length !== before) stripped += 1;
  }

  if (stripped > 0) {
    await writeFile(file, text);
    console.log(`✔ activities.ts — removed ${stripped} dead imageUrl reference(s)`);
  } else {
    console.log("✓ activities.ts — already clean");
  }
}

async function processHomepage() {
  const file = path.join(ROOT, "src/app/home-client.tsx");
  let text = await readFile(file, "utf8");
  let swapped = 0;

  for (const [from, to] of Object.entries(HOMEPAGE_REPLACEMENTS)) {
    if (text.includes(from)) {
      text = text.replaceAll(from, to);
      swapped += 1;
    }
  }

  if (swapped > 0) {
    await writeFile(file, text);
    console.log(`✔ home-client.tsx — swapped ${swapped} dead Unsplash ID(s)`);
  } else {
    console.log("✓ home-client.tsx — already clean");
  }
}

await processActivities();
await processHomepage();
console.log("done.");

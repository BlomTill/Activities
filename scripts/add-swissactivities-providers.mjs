#!/usr/bin/env node
/**
 * add-swissactivities-providers.mjs
 *
 * Walks src/data/activities.ts and ensures every activity has a
 * SwissActivities provider entry with our affiliate `?ref=odbhodn` URL.
 *
 *   1. If the photo-matcher (activity-images-swissactivities.json) has
 *      an exact `sourceUrl` for the activity → use that direct page URL.
 *   2. Otherwise → use a search URL that still carries the affiliate ref:
 *      https://www.swissactivities.com/en-ch/?search=<name>&ref=odbhodn
 *
 *   - Skips activities that already have a SwissActivities provider.
 *   - Idempotent: safe to re-run.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FILE = resolve(ROOT, "src", "data", "activities.ts");
const MATCHES_FILE = resolve(ROOT, "src", "data", "activity-images-swissactivities.json");

const AFFILIATE_REF = "ref=odbhodn";
const SEARCH_BASE = "https://www.swissactivities.com/en-ch/";

// ─── Load matches ─────────────────────────────────────────────────────────────

const matches = JSON.parse(readFileSync(MATCHES_FILE, "utf8"));
const directUrls = new Map(); // slug -> direct affiliate URL
for (const [slug, info] of Object.entries(matches.images || {})) {
  // Only trust matches with high confidence: exact, or fuzzy >= 0.7
  if (info.matchedBy === "exact" || (info.matchedBy?.startsWith("fuzzy:") && parseFloat(info.matchedBy.split(":")[1]) >= 0.7)) {
    if (info.sourceUrl) {
      const sep = info.sourceUrl.includes("?") ? "&" : "?";
      directUrls.set(slug, info.sourceUrl + sep + AFFILIATE_REF);
    }
  }
}

// ─── Walk activities.ts ───────────────────────────────────────────────────────

let text = readFileSync(FILE, "utf8");
const before = text.length;

// Find each activity object: { id: "N", slug: "...", ... providers: [...] ...}
// Strategy: find each "providers: [" position, walk back to find slug, then
// inject inside the array if SwissActivities entry not present.

let injected = 0;
let alreadyHas = 0;

// Match providers array start, then capture the array contents up to closing `]`
const providersRe = /providers:\s*\[/g;
const out = [];
let lastEnd = 0;
let m;
while ((m = providersRe.exec(text)) !== null) {
  const arrStart = m.index + m[0].length - 1; // index of `[`
  // Find matching `]` (balanced, ignoring strings)
  let depth = 0, inStr = false, esc = false, j = arrStart;
  for (; j < text.length; j++) {
    const c = text[j];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { j++; break; } }
  }
  const arrText = text.slice(arrStart, j);

  // Walk backward from m.index to find the slug field of this activity.
  // Activities can be quite long (descriptions, gallery), so search up to
  // 6000 chars back. Take the LAST slug/name occurrence — that's the
  // current activity, since slug appears once per activity.
  const back = text.slice(Math.max(0, m.index - 6000), m.index);
  const slugMatch = [...back.matchAll(/slug:\s*"([^"]+)"/g)].pop();
  const nameMatch = [...back.matchAll(/name:\s*"([^"]+)"/g)].pop();
  const slug = slugMatch ? slugMatch[1] : null;
  const name = nameMatch ? nameMatch[1] : null;

  // Skip if SwissActivities already in this providers array
  if (/name:\s*"SwissActivities"/.test(arrText)) {
    alreadyHas++;
    out.push(text.slice(lastEnd, j));
    lastEnd = j;
    continue;
  }

  if (!slug) {
    out.push(text.slice(lastEnd, j));
    lastEnd = j;
    continue;
  }

  // Decide URL
  let bookingUrl;
  if (directUrls.has(slug)) {
    bookingUrl = directUrls.get(slug);
  } else if (name) {
    bookingUrl = `${SEARCH_BASE}?search=${encodeURIComponent(name)}&${AFFILIATE_REF}`;
  } else {
    bookingUrl = `${SEARCH_BASE}?${AFFILIATE_REF}`;
  }

  // Build new provider entry
  const saEntry = `      {
        name: "SwissActivities",
        pricing: { child: 0, student: 0, adult: 0, senior: 0 },
        bookingUrl: ${JSON.stringify(bookingUrl)},
        rating: 4.6,
        description: "Switzerland's biggest activities marketplace — verified suppliers, free cancellation",
      },\n`;

  // Insert just after the opening `[` (before existing entries) or before
  // the closing `]`. We insert before `]` to keep order: existing first, SA last.
  const insertPoint = j - 1; // position of `]`
  // arrText looks like "[ ... ]"; slice text up to insertPoint, append SA, then continue
  const beforeBracket = text.slice(lastEnd, insertPoint);
  // Make sure there's a comma if existing array isn't empty
  const trimmed = arrText.slice(0, -1).trim(); // drop closing ]
  const needsComma = trimmed.length > 1 && !trimmed.endsWith(",") && !trimmed.endsWith("[");
  out.push(beforeBracket + (needsComma ? "," : "") + "\n" + saEntry + "    ");
  lastEnd = insertPoint;
  injected++;
}

out.push(text.slice(lastEnd));
text = out.join("");

writeFileSync(FILE, text);

console.log(`✅ Injected SwissActivities provider into ${injected} activities`);
console.log(`   Skipped (already had one): ${alreadyHas}`);
console.log(`   Direct URL matches:        ${[...directUrls.keys()].filter((s) => !/^pony-|^individual-|^custom-|^small-/.test(s)).length} popular`);
console.log(`   File size: ${before} → ${text.length} chars`);

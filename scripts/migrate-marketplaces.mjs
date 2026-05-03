#!/usr/bin/env node
/**
 * migrate-marketplaces.mjs
 *
 * One-time data migration: pulls SwissActivities / GetYourGuide / Viator /
 * Klook / Musement / Civitatis / Booking / Omio entries out of every
 * activity's `providers: [...]` array and into a sibling `marketplaces: [...]`
 * array — but ONLY when the entry has `pricing: { 0,0,0,0 }`.
 *
 * Why: the original add-swissactivities-providers.mjs script injected a
 * marketplace entry into providers[] with all-zero pricing as a
 * placeholder. This made `getBestPrice()` return 0 for every activity and
 * routed the "Book Best Price" CTA to whichever marketplace was the cheapest
 * (i.e. always the zero-priced one). Splitting them out fixes the price
 * comparison and the affiliate CTA in one go.
 *
 * Idempotent — re-running the script is safe: activities that already have
 * a `marketplaces` array are skipped.
 *
 * Run with:
 *   node scripts/migrate-marketplaces.mjs
 *   npm run content:build
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FILE = resolve(ROOT, "src", "data", "activities.ts");

// ─── Marketplace allow-list ──────────────────────────────────────────────────
// (provider-name → partner-id used in src/data/affiliate-partners.ts)
const MARKETPLACE_NAMES = new Map([
  ["swissactivities", "swissactivities"],
  ["getyourguide", "getyourguide"],
  ["viator", "viator"],
  ["klook", "klook"],
  ["musement", "musement"],
  ["civitatis", "civitatis"],
  ["booking.com", "booking"],
  ["booking", "booking"],
  ["omio", "omio"],
  ["rentalcars.com", "rentalcars"],
]);

const MARKETPLACE_DOMAINS = [
  ["swissactivities.com", "swissactivities"],
  ["getyourguide.com", "getyourguide"],
  ["getyourguide.ch", "getyourguide"],
  ["viator.com", "viator"],
  ["klook.com", "klook"],
  ["musement.com", "musement"],
  ["civitatis.com", "civitatis"],
  ["booking.com", "booking"],
  ["omio.com", "omio"],
  ["rentalcars.com", "rentalcars"],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function partnerIdFromEntry({ name, bookingUrl }) {
  const lname = String(name || "").trim().toLowerCase();
  if (MARKETPLACE_NAMES.has(lname)) return MARKETPLACE_NAMES.get(lname);
  const u = String(bookingUrl || "").toLowerCase();
  for (const [domain, id] of MARKETPLACE_DOMAINS) {
    if (u.includes(domain)) return id;
  }
  return null;
}

function isAllZeroPriced(p) {
  if (!p?.pricing) return false;
  return ["child", "student", "adult", "senior"].every(
    (k) => Number(p.pricing[k] ?? 0) === 0
  );
}

function isDirectActivityLink(url) {
  if (!url) return false;
  // Search-results pages on SwissActivities use ?search=…
  if (/\/\?search=/i.test(url)) return false;
  // GetYourGuide /s/?q=… is a search results page.
  if (/\/s\/\?q=/i.test(url)) return false;
  // Viator /search/{name} is a search results page.
  if (/\/search\//i.test(url)) return false;
  // Bare partner home page = not direct.
  try {
    const u = new URL(url);
    if (u.pathname === "/" || u.pathname === "") return false;
    return true;
  } catch {
    return false;
  }
}

function partnerDisplayName(partnerId) {
  switch (partnerId) {
    case "swissactivities": return "SwissActivities";
    case "getyourguide":    return "GetYourGuide";
    case "viator":          return "Viator";
    case "klook":           return "Klook";
    case "musement":        return "Musement";
    case "civitatis":       return "Civitatis";
    case "booking":         return "Booking.com";
    case "omio":            return "Omio";
    case "rentalcars":      return "Rentalcars.com";
    default:                return partnerId;
  }
}

// ─── Walk activities.ts as text ──────────────────────────────────────────────
//
// We deliberately operate on the source text rather than evaluating it —
// activities.ts is 40k+ lines and round-tripping it through a parser would
// reflow + lose comments. Instead we locate each activity's `providers: [`
// block, parse just that array via vm, decide what to keep, and rewrite
// the array span in place. We also inject a `marketplaces: [...]` block
// right after providers when there's anything to insert.

import vm from "node:vm";

let text = readFileSync(FILE, "utf8");
const beforeBytes = text.length;

const providersOpenRe = /providers:\s*\[/g;
let m;

const edits = []; // [{start, end, replacement}]
const stats = { migrated: 0, skipped: 0, alreadyHasMarketplaces: 0, providersEmptied: 0, parseErrors: 0 };

while ((m = providersOpenRe.exec(text)) !== null) {
  const arrStart = m.index + m[0].length - 1; // index of `[`

  // Walk balanced brackets to find matching `]`
  let depth = 0, inStr = false, esc = false, j = arrStart, strCh = "";
  for (; j < text.length; j++) {
    const c = text[j];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (inStr) {
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = true; strCh = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) { j++; break; } }
  }
  const arrText = text.slice(arrStart, j); // includes [ ... ]
  const arrEnd = j;

  // Lookahead: is the next non-whitespace token already "marketplaces:"?
  // If so, skip — already migrated.
  const after = text.slice(arrEnd, arrEnd + 200);
  if (/^\s*,\s*marketplaces\s*:/.test(after)) {
    stats.alreadyHasMarketplaces++;
    continue;
  }

  // Parse the array literal in a sandbox
  let parsed;
  try {
    parsed = vm.runInNewContext(`(${arrText})`, {}, { timeout: 5000 });
  } catch {
    stats.parseErrors++;
    continue;
  }
  if (!Array.isArray(parsed)) continue;

  const keep = [];
  const move = [];
  for (const p of parsed) {
    if (!p || typeof p !== "object") { keep.push(p); continue; }
    const partnerId = partnerIdFromEntry(p);
    if (partnerId && isAllZeroPriced(p)) {
      move.push({
        partnerId,
        partnerName: p.name || partnerDisplayName(partnerId),
        bookingUrl: p.bookingUrl,
        isDirectLink: isDirectActivityLink(p.bookingUrl),
        ...(typeof p.rating === "number" ? { rating: p.rating } : {}),
        ...(p.description ? { description: p.description } : {}),
      });
    } else {
      keep.push(p);
    }
  }

  if (move.length === 0) {
    stats.skipped++;
    continue;
  }

  // ── Build replacement text ────────────────────────────────────────────
  // Re-emit providers[] preserving original style (one entry per line,
  // 6-space indent for entries, 4-space indent for the closing bracket
  // so the file is readable). We always use a fixed indentation rather
  // than detecting the original line's indent, because `providers:` is
  // often on the same line as `{ id: "...", ...` for compactly-imported
  // activities — and copying that line's prefix as "indent" would
  // duplicate the entire activity opener into the marketplaces line.
  const PROVIDER_ENTRY_INDENT = "      ";
  const ARRAY_CLOSE_INDENT = "    ";
  const SIBLING_INDENT = "    ";

  const providersOut = keep.length === 0
    ? "[]"
    : [
        "[",
        ...keep.map((p) => `${PROVIDER_ENTRY_INDENT}${stringifyProvider(p)},`),
        `${ARRAY_CLOSE_INDENT}]`,
      ].join("\n");

  const marketplacesOut = [
    "marketplaces: [",
    ...move.map((mk) => `${PROVIDER_ENTRY_INDENT}${stringifyMarketplace(mk)},`),
    `${ARRAY_CLOSE_INDENT}]`,
  ].join("\n");

  edits.push({
    start: arrStart,
    end: arrEnd,
    replacement: `${providersOut},\n${SIBLING_INDENT}${marketplacesOut}`,
  });
  stats.migrated++;
  if (keep.length === 0) stats.providersEmptied++;
}

// Apply edits in reverse so earlier indices stay valid
edits.sort((a, b) => b.start - a.start);
for (const e of edits) {
  text = text.slice(0, e.start) + e.replacement + text.slice(e.end);
}

writeFileSync(FILE, text);

console.log("✅ Marketplace migration complete");
console.log(`   migrated activities:           ${stats.migrated}`);
console.log(`   already had marketplaces:      ${stats.alreadyHasMarketplaces}`);
console.log(`   skipped (no zero-price entry): ${stats.skipped}`);
console.log(`   providers[] now empty:         ${stats.providersEmptied}`);
console.log(`   parse errors:                  ${stats.parseErrors}`);
console.log(`   file size:                     ${beforeBytes} → ${text.length} chars`);
console.log("\n   Run \`npm run content:build\` to regenerate .content/generated/.");

// ─── stringifiers ─────────────────────────────────────────────────────────────

function stringifyProvider(p) {
  // We round-trip through JSON then strip key quotes so the output looks
  // like the rest of activities.ts (unquoted keys, double-quoted strings).
  const json = JSON.stringify(p);
  return unquoteKeys(json);
}

function stringifyMarketplace(mk) {
  const json = JSON.stringify(mk);
  return unquoteKeys(json);
}

/**
 * Convert {"foo":1,"bar baz":2} → {foo:1,"bar baz":2}
 * Only unquotes keys that are valid JS identifiers — preserves keys that
 * contain spaces / hyphens. We deliberately don't add spaces around `:`
 * or `,` because that would corrupt URL strings like "https://..." into
 * "https: //...".
 */
function unquoteKeys(json) {
  return json.replace(/"([A-Za-z_$][\w$]*)":/g, "$1:");
}

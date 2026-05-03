#!/usr/bin/env node
/**
 * promote-marketplace-prices.mjs
 *
 * Pass 3 of the SwissActivities pipeline.
 *
 * Reads .content/swissactivities-prices.json (output of pass 2) and, for
 * every activity that has a scraped adult price, injects a real
 * `Provider` entry into `Activity.providers[]` in src/data/activities.ts.
 *
 * After running this, an activity that was previously "marketplace-only"
 * (and therefore showed "Check price" in the UI) will instead show:
 *   - A real CHF price on the catalogue card and detail page
 *   - A "Best price" provider entry that books straight into SA via our affiliate link
 *
 * Idempotent — running the script twice is safe:
 *   - For each target activity we look at `providers[]` and replace any
 *     pre-existing entry whose `name` matches the supplier OR whose
 *     bookingUrl host is `swissactivities.com`. So re-runs upgrade the
 *     prices in place rather than duplicating providers.
 *
 * Pricing model (documented because it's an approximation):
 *   adult   = round(minAdult)
 *   child   = round(minAdult * 0.5)   — heuristic; SA only exposes adult
 *   student = round(minAdult * 0.85)
 *   senior  = round(minAdult * 0.9)
 *
 *   When `startingPriceType === "group"` the price is per-group, so we
 *   don't promote it (would be wildly misleading on a per-person card).
 *
 * Usage:
 *   node scripts/promote-marketplace-prices.mjs
 *   npm run content:build
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ACTIVITIES_FILE = resolve(ROOT, "src/data/activities.ts");
const PRICES_FILE = resolve(ROOT, ".content/swissactivities-prices.json");

// ─── Pricing model ────────────────────────────────────────────────────────────

function buildPricing(adult) {
  const a = Math.round(adult);
  return {
    child: Math.max(0, Math.round(a * 0.5)),
    student: Math.max(0, Math.round(a * 0.85)),
    adult: a,
    senior: Math.max(0, Math.round(a * 0.9)),
  };
}

function isSwissactivitiesUrl(url) {
  return /^https?:\/\/(www\.)?swissactivities\.com/i.test(url ?? "");
}

function buildProvider(slug, priceSummary, bookingUrl) {
  const supplier = priceSummary.supplier?.trim();
  const hasSupplier = supplier && supplier.length > 1 && supplier.length < 80;
  const name = hasSupplier ? supplier : "SwissActivities";

  // User-facing description — talks about what the user gets, not how we
  // sourced the data.
  const description = hasSupplier
    ? `Operated by ${supplier}. Book via SwissActivities — free cancellation, instant confirmation.`
    : "Available on SwissActivities — verified suppliers, free cancellation, instant confirmation.";

  return {
    name,
    pricing: buildPricing(priceSummary.minAdult),
    bookingUrl,
    rating: 4.6,
    description,
    _slug: slug,                  // dropped by stringifier; just for debugging
  };
}

// ─── Source-text editor ───────────────────────────────────────────────────────

function unquoteKeys(json) {
  return json.replace(/"([A-Za-z_$][\w$]*)":/g, "$1:");
}

function stringifyProvider(p) {
  // Drop debug-only fields before serialising.
  const { _slug, ...clean } = p;
  void _slug;
  return unquoteKeys(JSON.stringify(clean));
}

/** Walk balanced brackets to find matching `]` for an `[` at `start`. */
function findMatchingBracket(text, start) {
  let depth = 0, inStr = false, esc = false, strCh = "";
  for (let j = start; j < text.length; j++) {
    const c = text[j];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (inStr) {
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = true; strCh = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return j + 1;
    }
  }
  return -1;
}

/** Extract `slug: "..."` value from the activity that contains `pos`. */
function findActivitySlug(text, pos) {
  // Scan backwards from `pos` until we cross more `}` than `{`, which
  // means we've left the current object literal. The first `slug:` we
  // pass on the way out belongs to this activity.
  // Simpler heuristic: search backwards for the nearest `slug: "..."`.
  const head = text.slice(0, pos);
  const last = head.lastIndexOf("slug:");
  if (last < 0) return null;
  const m = text.slice(last, last + 200).match(/slug:\s*"([^"]+)"/);
  return m?.[1] ?? null;
}

/** Re-emit the providers[] block with our merge applied. */
function emitProvidersArray(parsed, scraped, slug, saUrl) {
  // Replace any existing entry whose name matches our supplier OR whose
  // bookingUrl host is swissactivities.com. This guarantees idempotency.
  const supplierLc = (scraped.supplier ?? "").toLowerCase();
  const filtered = parsed.filter((p) => {
    if (!p || typeof p !== "object") return true;
    const nameLc = String(p.name ?? "").toLowerCase();
    if (supplierLc && nameLc === supplierLc) return false;
    if (isSwissactivitiesUrl(p.bookingUrl)) return false;
    return true;
  });

  const newProvider = buildProvider(slug, scraped, saUrl);
  filtered.push(newProvider);

  if (filtered.length === 0) return "[]";
  return [
    "[",
    ...filtered.map((p) => `      ${stringifyProvider(p)},`),
    "    ]",
  ].join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(PRICES_FILE)) {
    console.error(`❌ ${PRICES_FILE} not found. Run \`npm run scrape:swissactivities-prices\` first.`);
    process.exit(1);
  }
  if (!existsSync(ACTIVITIES_FILE)) {
    console.error(`❌ ${ACTIVITIES_FILE} not found.`);
    process.exit(1);
  }

  const prices = JSON.parse(readFileSync(PRICES_FILE, "utf8"));
  let text = readFileSync(ACTIVITIES_FILE, "utf8");

  const stats = {
    activitiesPromoted: 0,
    skippedNoPrice: 0,
    skippedGroup: 0,
    skippedZeroAdult: 0,
    parseErrors: 0,
  };

  // Find every providers: [ … ] block, in reverse order of position so
  // earlier indices stay valid as we splice.
  const matches = [];
  const re = /providers:\s*\[/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const arrStart = m.index + m[0].length - 1; // index of [
    matches.push({ regexIdx: m.index, arrStart });
  }

  matches.reverse();

  for (const { regexIdx, arrStart } of matches) {
    const arrEnd = findMatchingBracket(text, arrStart);
    if (arrEnd < 0) continue;

    const slug = findActivitySlug(text, regexIdx);
    if (!slug) continue;
    const scraped = prices[slug];
    if (!scraped) { stats.skippedNoPrice++; continue; }
    if (!scraped.minAdult || scraped.minAdult <= 0) { stats.skippedZeroAdult++; continue; }
    if (scraped.startingPriceType === "group") { stats.skippedGroup++; continue; }

    const arrText = text.slice(arrStart, arrEnd);
    let parsed;
    try {
      parsed = vm.runInNewContext(`(${arrText})`, {}, { timeout: 5000 });
    } catch {
      stats.parseErrors++;
      continue;
    }
    if (!Array.isArray(parsed)) continue;

    const replacement = emitProvidersArray(parsed, scraped, slug, scraped.url + "?ref=odbhodn");
    text = text.slice(0, arrStart) + replacement + text.slice(arrEnd);
    stats.activitiesPromoted++;
  }

  writeFileSync(ACTIVITIES_FILE, text);

  console.log("✅ Marketplace-price promotion complete");
  console.log(`   activities upgraded:     ${stats.activitiesPromoted}`);
  console.log(`   skipped — no scraped price: ${stats.skippedNoPrice}`);
  console.log(`   skipped — group pricing:    ${stats.skippedGroup}`);
  console.log(`   skipped — zero adult:       ${stats.skippedZeroAdult}`);
  console.log(`   parse errors:               ${stats.parseErrors}`);
  console.log("\n   Run \`npm run content:build\` to regenerate generated content.");
}

main();

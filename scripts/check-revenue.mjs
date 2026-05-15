#!/usr/bin/env node
/**
 * check-revenue.mjs
 *
 * Revenue safety net. Fails CI if any MVP activity would ship without at
 * least one affiliate link carrying a REAL tracking ID — i.e. a click that
 * actually pays commission. Also reports per-network approval status so we
 * can see at a glance which programs Till still needs to get approved for.
 *
 * WHY: the entire business model is affiliate commission. A silent
 * regression here (placeholder ID shipped, broken deep link, unfilled
 * search template) means real traffic generates $0. This guards
 * MVP_LAUNCH_PLAN.md non-negotiable (a): every activity page must show
 * tracked, revenue-bearing links.
 *
 * It mirrors the real runtime logic in src/lib/affiliate.ts
 * (buildAffiliateUrl + getMarketplaceLinks) and src/data/affiliate-partners.ts
 * (trackingFromEnv). A drift guard fails if the env-var keys in
 * affiliate-partners.ts no longer match this script's NETWORK table, so the
 * two can't silently diverge.
 *
 * Usage:
 *   node scripts/check-revenue.mjs            # human report, CI exit code
 *   node scripts/check-revenue.mjs --verbose  # also list failing slugs
 *   node scripts/check-revenue.mjs --json     # machine-readable
 *
 * Exit codes:
 *   0  every MVP activity has >=1 real-tracked link, no broken URLs
 *   1  >=1 MVP activity has no revenue-bearing link, OR a broken/untracked
 *      URL, OR the drift guard tripped
 *
 * Unapproved networks (placeholder IDs) are WARNINGS, not failures —
 * expected before Till finishes affiliate applications.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const GENERATED_FULL = resolve(ROOT, ".content/generated/activities.full.json");
const PARTNERS_TS = resolve(ROOT, "src/data/affiliate-partners.ts");
const ENV_LOCAL = resolve(ROOT, ".env.local");

const ARGV = process.argv.slice(2);
const VERBOSE = ARGV.includes("--verbose");
const AS_JSON = ARGV.includes("--json");

// ─── Minimal .env.local loader (no dependency) ────────────────────────────────
// Next.js loads .env.local for the app automatically; a standalone script must
// do it itself so the validator reflects the same config the site would use.
function loadEnvLocal() {
  const env = { ...process.env };
  if (!existsSync(ENV_LOCAL)) return env;
  for (const raw of readFileSync(ENV_LOCAL, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in env) || !env[key]) env[key] = val;
  }
  return env;
}
const ENV = loadEnvLocal();

// ─── Network table (mirrors src/data/affiliate-partners.ts) ───────────────────
// id, recognised domains, env key, dev fallback, search template, marketplace.
// Kept in sync by the drift guard below.
const NETWORKS = [
  { id: "getyourguide", name: "GetYourGuide", domains: ["getyourguide.com", "getyourguide.ch"],
    envKey: "NEXT_PUBLIC_AFFILIATE_GETYOURGUIDE_PARAMS",
    fallback: "partner_id=XXXXXXX&utm_medium=online_publisher&utm_source=realswitzerland",
    searchTemplate: "https://www.getyourguide.com/s/?q={name}&country_id=200", marketplace: true },
  { id: "viator", name: "Viator", domains: ["viator.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_VIATOR_PARAMS",
    fallback: "pid=P00XXXXX&mcid=42383&medium=link",
    searchTemplate: "https://www.viator.com/search/{name}?geo=302860", marketplace: true },
  { id: "booking", name: "Booking.com", domains: ["booking.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_BOOKING_PARAMS",
    fallback: "aid=XXXXXXX&label=realswitzerland", searchTemplate: null, marketplace: false },
  { id: "klook", name: "Klook", domains: ["klook.com", "affiliate.klook.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_KLOOK_PARAMS",
    fallback: "aid=120379&aff_platform=online_publisher",
    searchTemplate: "https://www.klook.com/en-CH/search/result/?keyword={name}", marketplace: true },
  { id: "travelpayouts", name: "Travelpayouts", domains: ["tp.media", "aviasales.com", "wayaway.io", "hotellook.com", "emrldtp.cc"],
    envKey: "NEXT_PUBLIC_AFFILIATE_TRAVELPAYOUTS_PARAMS",
    fallback: "marker=724838", searchTemplate: null, marketplace: false },
  { id: "omio", name: "Omio", domains: ["omio.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_OMIO_PARAMS",
    fallback: "partner_id=realswitzerland", searchTemplate: null, marketplace: false },
  { id: "swissactivities", name: "SwissActivities", domains: ["swissactivities.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_SWISSACTIVITIES_PARAMS",
    fallback: "ref=odbhodn",
    searchTemplate: "https://www.swissactivities.com/en-ch/activities/?q={name}&ref=odbhodn", marketplace: true },
  { id: "rentalcars", name: "Rentalcars.com", domains: ["rentalcars.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_RENTALCARS_PARAMS",
    fallback: "affiliateCode=realswitzerland", searchTemplate: null, marketplace: false },
  { id: "swisspass", name: "Swiss Travel Pass (Interrail)", domains: ["interrail.eu", "eurail.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_SWISSPASS_PARAMS",
    fallback: "partner_id=realswitzerland", searchTemplate: null, marketplace: false },
  { id: "musement", name: "Musement", domains: ["musement.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_MUSEMENT_PARAMS",
    fallback: "utm_source=realswitzerland&utm_medium=affiliate&utm_campaign=XXXXXXX",
    searchTemplate: "https://www.musement.com/en/{citySlug}/", marketplace: true },
  { id: "civitatis", name: "Civitatis", domains: ["civitatis.com"],
    envKey: "NEXT_PUBLIC_AFFILIATE_CIVITATIS_PARAMS",
    fallback: "aid=XXXXXXX&utm_source=realswitzerland",
    searchTemplate: "https://www.civitatis.com/en/{citySlug}/", marketplace: true },
];

// ─── Drift guard ──────────────────────────────────────────────────────────────
// If affiliate-partners.ts adds/removes a NEXT_PUBLIC_AFFILIATE_*_PARAMS key,
// fail loudly rather than validate against a stale table.
function driftGuard() {
  const src = readFileSync(PARTNERS_TS, "utf8");
  const found = new Set(
    [...src.matchAll(/NEXT_PUBLIC_AFFILIATE_[A-Z0-9_]+_PARAMS/g)].map((m) => m[0]),
  );
  const table = new Set(NETWORKS.map((n) => n.envKey));
  const missing = [...found].filter((k) => !table.has(k));
  const extra = [...table].filter((k) => !found.has(k));
  if (missing.length || extra.length) {
    console.error("✗ check:revenue drift guard — NETWORK table out of sync with affiliate-partners.ts");
    if (missing.length) console.error(`  In affiliate-partners.ts but not this script: ${missing.join(", ")}`);
    if (extra.length) console.error(`  In this script but not affiliate-partners.ts: ${extra.join(", ")}`);
    console.error("  Update the NETWORKS table in scripts/check-revenue.mjs.");
    process.exit(1);
  }
}

// ─── Tracking-param resolution (mirrors trackingFromEnv) ───────────────────────
const PLACEHOLDER_RE = /(x{3,}|p00xxxxx)/i;

function isRealValue(v) {
  return Boolean(v) && !PLACEHOLDER_RE.test(v);
}

/**
 * Resolve a network's tracking params using the EXACT production posture of
 * trackingFromEnv() in src/data/affiliate-partners.ts: in production an unset
 * env var yields "" (no params appended) — the code fallback is dev-only and
 * is NEVER what ships. So a network only counts as approved when Till has set
 * a real value in .env.local / Vercel env. SwissActivities is the exception:
 * its commission rides on the ?ref=odbhodn already embedded in each scraped
 * booking URL, not on trackingParams — handled per-link via urlEmbedsRealRef.
 */
function resolveTracking(net) {
  const envVal = (ENV[net.envKey] ?? "").trim();
  const fromEnv = envVal.length > 0;
  const approved = fromEnv && isRealValue(envVal);
  const prodValue = approved ? envVal : ""; // what buildAffiliateUrl ships in prod
  let state;
  if (approved) state = "REAL";
  else if (fromEnv) state = "PLACEHOLDER (env)";
  else state = "UNSET (dev fallback only)";
  return {
    source: fromEnv ? "env (.env.local)" : "code fallback (dev only)",
    real: approved,
    prodValue,
    state,
  };
}

function partnerForUrl(bookingUrl) {
  let host;
  try {
    host = new URL(bookingUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const net of NETWORKS) {
    if (net.domains.some((d) => host === d || host.endsWith("." + d))) return net;
  }
  return null;
}

// ─── URL builders (mirror src/lib/affiliate.ts) ───────────────────────────────
function isPreAttributedViator(url) {
  if (!url.hostname.toLowerCase().includes("viator.com")) return false;
  const p = url.searchParams;
  return p.has("pid") && p.has("mcid") && p.get("medium") === "api";
}

function buildAffiliateUrl(bookingUrl, net, track, { slug, slot }) {
  try {
    const url = new URL(bookingUrl);
    if (isPreAttributedViator(url)) return { url: bookingUrl, ok: true, preAttributed: true };
    if (net && track && track.prodValue) {
      for (const [k, v] of new URLSearchParams(track.prodValue)) {
        if (!url.searchParams.has(k)) url.searchParams.set(k, v);
      }
    }
    if (slot) url.searchParams.set("es_slot", slot);
    if (slug) url.searchParams.set("es_slug", slug);
    return { url: url.toString(), ok: true };
  } catch {
    return { url: bookingUrl, ok: false };
  }
}

function fillTemplate(tpl, a) {
  const citySlug = String(a.location?.city ?? "")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return tpl
    .replace("{name}", encodeURIComponent(a.name))
    .replace("{city}", encodeURIComponent(a.location?.city ?? ""))
    .replace("{citySlug}", citySlug)
    .replace("{canton}", encodeURIComponent(a.location?.canton ?? ""));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
driftGuard();

if (!existsSync(GENERATED_FULL)) {
  console.error(`✗ ${GENERATED_FULL} not found. Run \`npm run content:build\` first.`);
  process.exit(1);
}
const all = JSON.parse(readFileSync(GENERATED_FULL, "utf8"));
const mvp = all.filter((a) => a.mvp === true);

const trackingByNet = Object.fromEntries(NETWORKS.map((n) => [n.id, resolveTracking(n)]));

const failures = []; // { slug, reason }
let activitiesWithRealLink = 0;
let brokenUrlCount = 0;
const networkUsage = Object.fromEntries(
  NETWORKS.map((n) => [n.id, { realLinks: 0, placeholderLinks: 0 }]),
);

for (const a of mvp) {
  let realLinkOnThisActivity = false;
  let activityHasBroken = false;

  const directPartnerIds = new Set();

  // 1. Direct marketplace listings.
  for (const m of a.marketplaces ?? []) {
    if (!m || typeof m.bookingUrl !== "string") continue;
    const net = partnerForUrl(m.bookingUrl) ||
      NETWORKS.find((n) => n.id === m.partnerId) || null;
    if (net) directPartnerIds.add(net.id);
    const track = net ? trackingByNet[net.id] : null;
    const built = buildAffiliateUrl(m.bookingUrl, net, track, {
      slug: a.slug, slot: "activity-detail-provider",
    });
    if (!built.ok) {
      activityHasBroken = true;
      failures.push({ slug: a.slug, reason: `unparseable bookingUrl: ${m.bookingUrl}` });
      continue;
    }
    if (/\{[a-z]+\}/i.test(built.url)) {
      activityHasBroken = true;
      failures.push({ slug: a.slug, reason: `unfilled template placeholder in ${built.url}` });
      continue;
    }
    // Real tracking if: partner params real, OR Viator pre-attributed, OR the
    // booking URL itself already embeds a real partner ref (e.g. ?ref=odbhodn).
    const urlEmbedsRealRef = net && isRealValue(net.fallback) &&
      m.bookingUrl.toLowerCase().includes(net.fallback.toLowerCase());
    const isReal = built.preAttributed || (track && track.real) || urlEmbedsRealRef;
    if (net) networkUsage[net.id][isReal ? "realLinks" : "placeholderLinks"]++;
    if (isReal) realLinkOnThisActivity = true;
  }

  // 2. Search-template links for active marketplace networks w/o a direct listing.
  for (const net of NETWORKS) {
    if (!net.marketplace || !net.searchTemplate) continue;
    if (directPartnerIds.has(net.id)) continue;
    const filled = fillTemplate(net.searchTemplate, a);
    const track = trackingByNet[net.id];
    const built = buildAffiliateUrl(filled, net, track, {
      slug: a.slug, slot: "activity-detail-provider",
    });
    if (!built.ok || /\{[a-z]+\}/i.test(built.url)) {
      activityHasBroken = true;
      failures.push({ slug: a.slug, reason: `bad search URL for ${net.id}: ${built.url}` });
      continue;
    }
    const urlEmbedsRealRef = isRealValue(net.fallback) &&
      filled.toLowerCase().includes(net.fallback.toLowerCase());
    const isReal = (track && track.real) || urlEmbedsRealRef;
    networkUsage[net.id][isReal ? "realLinks" : "placeholderLinks"]++;
    if (isReal) realLinkOnThisActivity = true;
  }

  if (activityHasBroken) brokenUrlCount++;
  if (realLinkOnThisActivity) activitiesWithRealLink++;
  else failures.push({ slug: a.slug, reason: "no affiliate link with a real tracking ID" });
}

const noRealLink = mvp.length - activitiesWithRealLink;
// A network is "live" if it has approved env params OR (SwissActivities) it
// earns via the ?ref=odbhodn embedded in every scraped booking URL.
function isLive(n) {
  if (trackingByNet[n.id].real) return true;
  return n.id === "swissactivities" && networkUsage[n.id].realLinks > 0;
}
const approved = NETWORKS.filter(isLive).map((n) =>
  n.id === "swissactivities" ? `${n.name} (embedded ref)` : n.name,
);
const unapproved = NETWORKS.filter((n) => !isLive(n)).map((n) => n.name);
const pass = noRealLink === 0 && brokenUrlCount === 0;

if (AS_JSON) {
  console.log(JSON.stringify({
    mvpActivities: mvp.length,
    activitiesWithRealLink,
    activitiesWithoutRealLink: noRealLink,
    brokenUrlCount,
    approvedNetworks: approved,
    unapprovedNetworks: unapproved,
    networkUsage,
    pass,
  }, null, 2));
  process.exit(pass ? 0 : 1);
}

console.log("\n─── check:revenue ───────────────────────────────────────────");
console.log(`MVP activities ............... ${mvp.length}`);
console.log(`With >=1 real-tracked link ... ${activitiesWithRealLink}`);
console.log(`WITHOUT a real-tracked link .. ${noRealLink}`);
console.log(`Activities w/ broken URL ..... ${brokenUrlCount}`);
console.log("\nPer-network tracking status:");
for (const n of NETWORKS) {
  const t = trackingByNet[n.id];
  const u = networkUsage[n.id];
  const live = isLive(n);
  const tag = t.real
    ? "✓ REAL     "
    : live
      ? "✓ EMBEDDED "
      : "⚠ PLACEHOLD";
  const src = t.real ? t.source : live ? "url ?ref=odbhodn" : t.source;
  console.log(
    `  ${tag} ${n.name.padEnd(24)} ${src.padEnd(24)} ` +
    `links: ${u.realLinks} real / ${u.placeholderLinks} placeholder`,
  );
}
console.log(`\nApproved (real ID): ${approved.length ? approved.join(", ") : "none"}`);
if (unapproved.length) {
  console.log(`⚠ Not yet approved (placeholder — Till must apply / add ID): ${unapproved.join(", ")}`);
}
if (VERBOSE && failures.length) {
  console.log("\nFailures:");
  for (const f of failures.slice(0, 50)) console.log(`  ${f.slug} — ${f.reason}`);
  if (failures.length > 50) console.log(`  …and ${failures.length - 50} more`);
}
console.log("──────────────────────────────────────────────────────────────");

if (pass) {
  console.log(`✓ PASS — every MVP activity has >=1 revenue-bearing affiliate link.\n`);
  process.exit(0);
}
console.log(`✗ FAIL — ${noRealLink} activity(ies) with no real-tracked link, ${brokenUrlCount} with broken URLs.`);
console.log(`  Run with --verbose to list them.\n`);
process.exit(1);

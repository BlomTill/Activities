/**
 * ──────────────────────────────────────────────────────────────────
 *  PriceComparisonTable — server component
 *
 *  This is the conversion centerpiece of every activity detail page.
 *  It pulls *live* prices from configured partner APIs (10-min cache),
 *  merges them with static `activity.providers` and `activity.marketplaces`
 *  for graceful degradation, sorts by price ascending, and renders a
 *  trust-building comparison row per partner.
 *
 *  Behavior summary:
 *    – Cheapest priced row gets the "Cheapest" badge.
 *    – Highest-rated row gets the "Best rated" badge (only when the
 *      rating gap is ≥0.2 stars — otherwise the badge is misleading).
 *    – Free-cancellation rows get an info badge.
 *    – Live rows show "Updated Xm ago"; static rows say nothing
 *      (we don't fake freshness).
 *    – Marketplace-only rows (no price) render as a "Check on …" CTA
 *      so the user still has a way to compare.
 *    – Emits Product + AggregateOffer JSON-LD when ≥2 priced rows.
 * ────────────────────────────────────────────────────────────────── */
import type { Activity } from "@/lib/types";
import { fetchLiveQuotes, type LiveQuote } from "@/lib/live-prices";
import { buildAffiliateUrl, getMarketplaceLinks } from "@/lib/affiliate";
import { AffiliateLink } from "@/components/affiliate-link";
import { resolveActivityImage } from "@/lib/images";
import { SITE_URL } from "@/lib/constants";

interface ComparisonRow {
  partnerId: string;
  partnerName: string;
  /** Lowest available adult price in CHF, or null when only a deep-link is known. */
  priceChf: number | null;
  rating?: number;
  reviewCount?: number;
  /** Already affiliate-tracked URL ready to use as an `<a href>`. */
  bookingUrl: string;
  isLive: boolean;
  freeCancellation?: boolean;
  /** ISO timestamp of when this quote was fetched, when isLive. */
  fetchedAt?: string;
}

/** Convert a LiveQuote → ComparisonRow. */
function rowFromLiveQuote(q: LiveQuote): ComparisonRow {
  return {
    partnerId: q.partnerId,
    partnerName: q.partnerName,
    priceChf: q.priceChf,
    rating: q.rating,
    reviewCount: q.reviewCount,
    bookingUrl: q.bookingUrl,
    isLive: true,
    freeCancellation: q.freeCancellation,
    fetchedAt: q.fetchedAt,
  };
}

/** Convert a static `Provider` → ComparisonRow (fallback when live unavailable). */
function rowFromStaticProvider(
  p: Activity["providers"][number],
  slug: string
): ComparisonRow {
  return {
    partnerId: p.name.toLowerCase().replace(/\s+/g, "-"),
    partnerName: p.name,
    priceChf: p.pricing.adult,
    rating: p.rating,
    bookingUrl: buildAffiliateUrl(p.bookingUrl, { slug, slot: "compare-cta" }),
    isLive: false,
  };
}

/** Merge live + static + marketplace rows. Live wins per partnerId. */
function buildRows(activity: Activity, live: LiveQuote[]): ComparisonRow[] {
  const seen = new Set<string>();
  const rows: ComparisonRow[] = [];

  for (const q of live) {
    seen.add(q.partnerId);
    rows.push(rowFromLiveQuote(q));
  }

  for (const p of activity.providers ?? []) {
    const id = p.name.toLowerCase().replace(/\s+/g, "-");
    if (seen.has(id)) continue;
    seen.add(id);
    rows.push(rowFromStaticProvider(p, activity.slug));
  }

  // Add marketplace deep-links (no price) only for partners we don't already have
  for (const link of getMarketplaceLinks(activity, "compare-cta")) {
    if (seen.has(link.partner.id)) continue;
    seen.add(link.partner.id);
    rows.push({
      partnerId: link.partner.id,
      partnerName: link.partner.name,
      priceChf: null,
      bookingUrl: link.url,
      isLive: false,
    });
  }

  // Sort: priced rows first (cheapest → most expensive), then deep-link rows
  rows.sort((a, b) => {
    const aHas = a.priceChf !== null;
    const bHas = b.priceChf !== null;
    if (aHas !== bHas) return aHas ? -1 : 1;
    if (aHas && bHas) return (a.priceChf as number) - (b.priceChf as number);
    return a.partnerName.localeCompare(b.partnerName);
  });
  return rows;
}

function pickCheapestId(rows: ComparisonRow[]): string | null {
  const priced = rows.filter((r) => r.priceChf !== null);
  if (priced.length < 2) return null; // don't badge "cheapest" when there's nothing to compare against
  return priced[0].partnerId;
}

function pickBestRatedId(rows: ComparisonRow[]): string | null {
  const rated = rows.filter((r) => typeof r.rating === "number");
  if (rated.length < 2) return null;
  rated.sort((a, b) => (b.rating as number) - (a.rating as number));
  const gap = (rated[0].rating as number) - (rated[1].rating as number);
  if (gap < 0.2) return null; // a rounding-noise gap doesn't deserve a badge
  return rated[0].partnerId;
}

function relativeMinutes(iso?: string): string | null {
  if (!iso) return null;
  const ageMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(ageMs / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  return null; // older than an hour shouldn't render — cache TTL prevents this
}

/** AggregateOffer JSON-LD — emitted only when ≥2 priced rows. */
function ComparisonJsonLd({
  activity,
  rows,
}: {
  activity: Activity;
  rows: ComparisonRow[];
}) {
  const priced = rows.filter((r) => r.priceChf !== null);
  if (priced.length < 2) return null;

  const prices = priced.map((r) => r.priceChf as number);
  const ratings = rows
    .map((r) => r.rating)
    .filter((r): r is number => typeof r === "number");
  const reviewCount = rows.reduce(
    (sum, r) => sum + (r.reviewCount ?? 0),
    0
  );
  const resolvedImage = resolveActivityImage(activity);

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: activity.name,
    description: activity.description,
    image: resolvedImage.src,
    url: `${SITE_URL}/activities/${activity.slug}`,
    brand: { "@type": "Brand", name: activity.providers[0]?.name ?? activity.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CHF",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: priced.length,
      availability: "https://schema.org/InStock",
      offers: priced.map((r) => ({
        "@type": "Offer",
        priceCurrency: "CHF",
        price: r.priceChf,
        url: r.bookingUrl,
        seller: { "@type": "Organization", name: r.partnerName },
        availability: "https://schema.org/InStock",
      })),
    },
  };

  if (ratings.length > 0) {
    const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    product.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(avg * 10) / 10,
      bestRating: 5,
      ratingCount: reviewCount > 0 ? reviewCount : ratings.length,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
    />
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "best" | "rated" | "info" }) {
  const tones: Record<typeof tone, string> = {
    best: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    rated: "bg-amber-100 text-amber-800 ring-amber-200",
    info: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

interface Props {
  activity: Activity;
}

export async function PriceComparisonTable({ activity }: Props) {
  const live = await fetchLiveQuotes(activity);
  const rows = buildRows(activity, live);
  const cheapestId = pickCheapestId(rows);
  const bestRatedId = pickBestRatedId(rows);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        No booking partners are currently listing this activity. Check back soon — we
        scan partner inventories every 10 minutes.
      </div>
    );
  }

  return (
    <section
      aria-label="Compare booking options"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <header className="flex items-baseline justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">
          Compare {rows.length} booking option{rows.length === 1 ? "" : "s"}
        </h2>
        <span className="text-xs text-slate-500">Live prices · CHF · per adult</span>
      </header>

      <ul className="divide-y divide-slate-100">
        {rows.map((row) => {
          const isCheapest = row.partnerId === cheapestId;
          const isBestRated = row.partnerId === bestRatedId;
          const fresh = relativeMinutes(row.fetchedAt);

          return (
            <li key={row.partnerId} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {row.partnerName}
                  </span>
                  {isCheapest && <Badge tone="best">Cheapest</Badge>}
                  {isBestRated && <Badge tone="rated">Best rated</Badge>}
                  {row.freeCancellation && <Badge tone="info">Free cancellation</Badge>}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {row.rating ? <span>{row.rating.toFixed(1)} ★</span> : null}
                  {row.rating && row.reviewCount ? (
                    <span> · {row.reviewCount.toLocaleString()} reviews</span>
                  ) : null}
                  {row.isLive && fresh ? (
                    <span> · Updated {fresh}</span>
                  ) : null}
                </div>
              </div>

              <div className="text-right">
                {row.priceChf !== null ? (
                  <div className="font-semibold text-slate-900">
                    from CHF {row.priceChf}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Check site</div>
                )}
              </div>

              <AffiliateLink
                href={row.bookingUrl}
                slot="compare-cta"
                slug={activity.slug}
                providerName={row.partnerName}
                priceChf={row.priceChf ?? undefined}
                className={`ml-2 inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isCheapest
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {row.priceChf !== null ? "Book" : "Check"} →
              </AffiliateLink>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Prices are pulled from each partner&apos;s API and refresh every ~10 minutes. We earn a
        commission from booking partners — your price stays the same.{" "}
        <a href="/partners" className="underline hover:text-slate-700">
          How we make money
        </a>
        .
      </footer>

      <ComparisonJsonLd activity={activity} rows={rows} />
    </section>
  );
}

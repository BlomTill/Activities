import { mvpActivities } from "@/lib/content/selectors";
import { getAverageRating, formatActivityPrice } from "@/lib/types";
import { resolveActivityImage } from "@/lib/images";
import { MVP_DESTINATIONS } from "@/lib/mvp-destinations";
import HomePageClient, { type HomeStats, type HomeDestination, type HomeTrending } from "./home-client";

/**
 * / — Server shell.
 *
 * Computes catalogue stats once at build time (catalogue size, per-category
 * counts, distinct cantons) and passes them down to the client island.
 * Avoids hardcoded "215 experiences" copy that drifts as the catalogue
 * grows.
 */
export default function HomePage() {
  const byCategory: Record<string, number> = {};
  const cantons = new Set<string>();
  let scenicRailwayCount = 0;

  for (const a of mvpActivities) {
    byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
    if (a.location.canton) cantons.add(a.location.canton);

    const sub = a.subcategory.toLowerCase();
    const tags = a.tags.map((t) => t.toLowerCase());
    if (sub.includes("rail") || sub.includes("train") || tags.includes("train") || tags.includes("railway")) {
      scenicRailwayCount += 1;
    }
  }

  const stats: HomeStats = {
    totalActivities: mvpActivities.length,
    cantonCount: cantons.size,
    byCategory,
    scenicRailwayCount,
  };

  const destCounts = new Map<string, number>();
  for (const a of mvpActivities) {
    if (a.mvpDestination) destCounts.set(a.mvpDestination, (destCounts.get(a.mvpDestination) ?? 0) + 1);
  }
  const destinations: HomeDestination[] = MVP_DESTINATIONS.map((d) => ({
    slug: d.slug,
    name: d.name,
    tagline: d.tagline,
    heroImage: d.heroImage,
    count: destCounts.get(d.name) ?? 0,
  }));

  // "Trending" proxy: highest verified rating among MVP (no review-count
  // data — verified-only; real analytics-driven ranking is Phase 2).
  const trending: HomeTrending[] = [...mvpActivities]
    .sort((a, b) => (getAverageRating(b) ?? 0) - (getAverageRating(a) ?? 0))
    .slice(0, 12)
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      image: resolveActivityImage(a).src,
      rating: getAverageRating(a),
      destination: a.mvpDestination ?? null,
      priceLabel: formatActivityPrice(a, "adult", { withFrom: true }),
    }));

  return <HomePageClient stats={stats} destinations={destinations} trending={trending} />;
}

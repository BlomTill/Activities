import { activities } from "@/lib/content/selectors";
import HomePageClient, { type HomeStats } from "./home-client";

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

  for (const a of activities) {
    byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
    if (a.location.canton) cantons.add(a.location.canton);

    const sub = a.subcategory.toLowerCase();
    const tags = a.tags.map((t) => t.toLowerCase());
    if (sub.includes("rail") || sub.includes("train") || tags.includes("train") || tags.includes("railway")) {
      scenicRailwayCount += 1;
    }
  }

  const stats: HomeStats = {
    totalActivities: activities.length,
    cantonCount: cantons.size,
    byCategory,
    scenicRailwayCount,
  };

  return <HomePageClient stats={stats} />;
}

import { MetadataRoute } from "next";
import { mvpActivities } from "@/lib/content/selectors";
import { blogPosts } from "@/lib/content/selectors";
import { MVP_DESTINATIONS } from "@/lib/mvp-destinations";

const BASE_URL = "https://realswitzerland.ch";

export default function sitemap(): MetadataRoute.Sitemap {
  // Phase 1: only the curated MVP activities are indexable. The other ~1,300
  // stay in the dataset but out of the sitemap until the Phase 2 audit clears
  // them (avoids the thin-content SEO penalty — see MVP_LAUNCH_PLAN.md §1).
  const activityPages = mvpActivities.map((activity) => ({
    url: `${BASE_URL}/activities/${activity.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Editorial posts live under /stories/<slug> in the new IA. The
  // /blog/<slug> route still exists but 301-redirects to /stories — so we
  // emit /stories URLs in the sitemap to avoid pointing Google at a
  // permanent-redirect chain.
  const blogPages = blogPosts.map((post) => ({
    url: `${BASE_URL}/stories/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const destinationPages = MVP_DESTINATIONS.map((d) => ({
    url: `${BASE_URL}/destinations/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Only Phase 1 live routes. Feature-flagged routes (/itineraries, /budget,
  // /map, /deals, /surprise, /partners) return 404 in the MVP, so they're
  // intentionally excluded — they come back in Phase 2 when re-enabled.
  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/activities`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/destinations`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/stories`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/compare`, priority: 0.5, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "monthly" as const },
  ].map((page) => ({ ...page, lastModified: new Date() }));

  return [...staticPages, ...activityPages, ...destinationPages, ...blogPages];
}

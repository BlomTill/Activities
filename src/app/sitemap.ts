import { MetadataRoute } from "next";
import { activities } from "@/lib/content/selectors";
import { blogPosts } from "@/lib/content/selectors";
import { itineraries } from "@/lib/content/selectors";
import { getDestinationSummaries } from "@/lib/destinations";

const BASE_URL = "https://realswitzerland.ch";

export default function sitemap(): MetadataRoute.Sitemap {
  const activityPages = activities.map((activity) => ({
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

  const itineraryPages = itineraries.map((itinerary) => ({
    url: `${BASE_URL}/itineraries/${itinerary.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const destinationPages = getDestinationSummaries().map((destination) => ({
    url: `${BASE_URL}/destinations/${destination.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/activities`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/destinations`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/itineraries`, priority: 0.85, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/budget`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/map`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/deals`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/stories`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/surprise`, priority: 0.6, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/compare`, priority: 0.5, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/partners`, priority: 0.4, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "monthly" as const },
  ].map((page) => ({ ...page, lastModified: new Date() }));

  return [...staticPages, ...activityPages, ...itineraryPages, ...destinationPages, ...blogPages];
}

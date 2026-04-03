import { MetadataRoute } from "next";
import { activities } from "@/data/activities";
import { blogPosts } from "@/data/blog-posts";

const BASE_URL = "https://swissactivity.ch";

export default function sitemap(): MetadataRoute.Sitemap {
  const activityPages = activities.map((activity) => ({
    url: `${BASE_URL}/activities/${activity.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogPages = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const staticPages = [
    { url: BASE_URL, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/activities`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/budget`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/map`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/deals`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${BASE_URL}/blog`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/surprise`, priority: 0.6, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/compare`, priority: 0.5, changeFrequency: "weekly" as const },
    { url: `${BASE_URL}/about`, priority: 0.4, changeFrequency: "monthly" as const },
  ].map((page) => ({ ...page, lastModified: new Date() }));

  return [...staticPages, ...activityPages, ...blogPages];
}

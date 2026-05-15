import type { Activity } from "@/lib/types";
import type { ItineraryDocument } from "@/lib/content/schemas";
import { contentRepository } from "@/lib/content/repository";

export function getActivities(): Activity[] {
  return contentRepository.getActivities();
}

export function getActivityBySlug(slug: string): Activity | undefined {
  return contentRepository.getActivityBySlug(slug);
}

export function getActivityById(id: string): Activity | undefined {
  return contentRepository.getActivityById(id);
}

export function getFeaturedActivities(): Activity[] {
  return getActivities().filter((a) => a.featured);
}

export function getActivitiesWithDeals(): Activity[] {
  return getActivities().filter((a) => Boolean(a.deal));
}

export function searchActivities(query: string): Activity[] {
  const lower = query.toLowerCase();
  return getActivities().filter(
    (a) =>
      a.name.toLowerCase().includes(lower) ||
      a.description.toLowerCase().includes(lower) ||
      a.subcategory.toLowerCase().includes(lower) ||
      a.category.toLowerCase().includes(lower) ||
      a.tags.some((t) => t.includes(lower)) ||
      a.location.city.toLowerCase().includes(lower) ||
      a.location.region.toLowerCase().includes(lower) ||
      a.location.canton.toLowerCase().includes(lower)
  );
}

export function getStories() {
  return contentRepository.getStories();
}

export function getStoryBySlug(slug: string) {
  return contentRepository.getStoryBySlug(slug);
}

export function getItineraries(): ItineraryDocument[] {
  return contentRepository.getItineraries();
}

export function getItineraryBySlug(slug: string): ItineraryDocument | undefined {
  return contentRepository.getItineraryBySlug(slug);
}

/**
 * Phase 1 MVP view — only the curated ~200 activities flagged `mvp === true`
 * (see scripts/select-mvp-activities.mjs). Sitemap, the /activities list, and
 * the home page render from this, not the full catalogue.
 */
export function getMvpActivities(): Activity[] {
  return getActivities().filter((a) => a.mvp === true);
}

// Backward-compatible aliases for incremental migration.
export const activities = contentRepository.getActivities();
export const mvpActivities = activities.filter((a) => a.mvp === true);
export const blogPosts = contentRepository.getStories();
export const itineraries = contentRepository.getItineraries();
export const getBlogPostBySlug = getStoryBySlug;

import type { Activity } from "@/lib/types";
import type { BlogPost } from "@/lib/types";
import type { ActivityListItem, StoryIndexItem, ItineraryDocument, ItineraryIndexItem } from "@/lib/content/schemas";

export interface ContentRepository {
  /**
   * By default returns only PUBLISHED activities (`published !== false`).
   * Pass `{ includeUnpublished: true }` for admin / content-check tooling
   * that needs to see the full set including quarantined entries.
   */
  getActivities(opts?: { includeUnpublished?: boolean }): Activity[];
  /**
   * Detail page lookup — returns the activity even if quarantined (so
   * direct links keep working in dev and e2e). The `app/activities/[slug]`
   * route is responsible for 404'ing or showing a "not yet launched" state
   * when `published === false`, based on the request's auth context.
   */
  getActivityBySlug(slug: string): Activity | undefined;
  getActivityById(id: string): Activity | undefined;
  /** List items default to published-only — these power index pages and search. */
  getActivityListItems(opts?: { includeUnpublished?: boolean }): ActivityListItem[];

  getStories(): BlogPost[];
  getStoryBySlug(slug: string): BlogPost | undefined;
  getStoryIndexItems(): StoryIndexItem[];

  getItineraries(): ItineraryDocument[];
  getItineraryBySlug(slug: string): ItineraryDocument | undefined;
  getItineraryIndexItems(): ItineraryIndexItem[];
}

import type { Activity } from "@/lib/types";
import type { BlogPost } from "@/lib/types";
import type { ActivityListItem, StoryIndexItem, ItineraryDocument, ItineraryIndexItem } from "@/lib/content/schemas";

export interface ContentRepository {
  getActivities(): Activity[];
  getActivityBySlug(slug: string): Activity | undefined;
  getActivityById(id: string): Activity | undefined;
  getActivityListItems(): ActivityListItem[];

  getStories(): BlogPost[];
  getStoryBySlug(slug: string): BlogPost | undefined;
  getStoryIndexItems(): StoryIndexItem[];

  getItineraries(): ItineraryDocument[];
  getItineraryBySlug(slug: string): ItineraryDocument | undefined;
  getItineraryIndexItems(): ItineraryIndexItem[];
}

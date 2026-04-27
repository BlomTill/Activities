import type { ContentRepository } from "@/lib/content/contracts";
import type { Activity } from "@/lib/types";
import type { BlogPost } from "@/lib/types";
import type { ActivityListItem, StoryIndexItem, ItineraryDocument, ItineraryIndexItem } from "@/lib/content/schemas";

import activitiesFull from "../../../../.content/generated/activities.full.json";
import activitiesBySlug from "../../../../.content/generated/activities.by-slug.json";
import activitiesList from "../../../../.content/generated/activities.list.json";
import activitySlugAliases from "../../../../.content/generated/activities.slug-aliases.json";

import storiesFull from "../../../../.content/generated/stories.full.json";
import storiesBySlug from "../../../../.content/generated/stories.by-slug.json";
import storiesList from "../../../../.content/generated/stories.list.json";

import itinerariesFull from "../../../../.content/generated/itineraries.full.json";
import itinerariesBySlug from "../../../../.content/generated/itineraries.by-slug.json";
import itinerariesList from "../../../../.content/generated/itineraries.list.json";

const activities = activitiesFull as Activity[];
const activityBySlug = activitiesBySlug as Record<string, Activity>;
const activityList = activitiesList as ActivityListItem[];
const slugAliases = activitySlugAliases as Record<string, string>;

const stories = storiesFull as BlogPost[];
const storyBySlug = storiesBySlug as Record<string, BlogPost>;
const storyList = storiesList as StoryIndexItem[];

const itineraries = itinerariesFull as ItineraryDocument[];
const itineraryBySlug = itinerariesBySlug as Record<string, ItineraryDocument>;
const itineraryList = itinerariesList as ItineraryIndexItem[];

const activityById = new Map(activities.map((a) => [a.id, a]));

export const generatedContentRepository: ContentRepository = {
  getActivities() {
    return activities;
  },
  getActivityBySlug(slug) {
    return activityBySlug[slug] ?? activityBySlug[slugAliases[slug] ?? ""];
  },
  getActivityById(id) {
    return activityById.get(id);
  },
  getActivityListItems() {
    return activityList;
  },

  getStories() {
    return stories;
  },
  getStoryBySlug(slug) {
    return storyBySlug[slug];
  },
  getStoryIndexItems() {
    return storyList;
  },

  getItineraries() {
    return itineraries;
  },
  getItineraryBySlug(slug) {
    return itineraryBySlug[slug];
  },
  getItineraryIndexItems() {
    return itineraryList;
  },
};

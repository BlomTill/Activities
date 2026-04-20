import { blogPosts } from "@/data/blog-posts";
import { Activity } from "./types";

function scorePost(postTags: string[], keywords: string[]) {
  const loweredTags = postTags.map((tag) => tag.toLowerCase());
  return keywords.reduce((score, keyword) => {
    const normalized = keyword.toLowerCase();
    return loweredTags.some((tag) => tag.includes(normalized) || normalized.includes(tag)) ? score + 1 : score;
  }, 0);
}

export function getRelatedBlogPosts(keywords: string[], limit = 3) {
  return [...blogPosts]
    .map((post) => ({
      post,
      score: scorePost(post.tags, keywords) + scorePost([post.slug, post.title], keywords),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
    .slice(0, limit)
    .map((entry) => entry.post);
}

export function getRelatedBlogPostsForDestination(region: string, cities: string[], categories: string[], seasons: string[] = [], limit = 3) {
  return getRelatedBlogPosts([region, ...cities, ...categories, ...seasons], limit);
}

export function getRelatedBlogPostsForActivities(activities: Activity[], extraKeywords: string[] = [], limit = 3) {
  const keywords = [
    ...extraKeywords,
    ...activities.flatMap((activity) => [
      activity.name,
      activity.location.city,
      activity.location.region,
      activity.category,
      ...activity.tags,
      ...activity.seasons,
    ]),
  ];

  return getRelatedBlogPosts(keywords, limit);
}

import { activities } from "@/data/activities";
import { itineraries } from "@/data/itineraries";
import { getAverageRating, getBestPrice } from "./types";
import { estimateSBBFare } from "./sbb";

export interface DestinationSummary {
  slug: string;
  name: string;
  description: string;
  heroImage: string;
  activityCount: number;
  featuredCount: number;
  minPrice: number;
  topCities: string[];
  categories: string[];
  itineraryCount: number;
  averageRating: number;
}

function slugifyRegion(region: string) {
  return region
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getDestinationDescription(region: string, topCities: string[], categories: string[]) {
  const cityLabel = topCities.slice(0, 3).join(", ");
  const categoryLabel = categories.slice(0, 3).join(", ");
  return `Explore ${region} through ${categoryLabel} experiences around ${cityLabel}. Start with top-rated activities, budget ideas, and trip-ready routes.`;
}

export function getDestinationSummaries(): DestinationSummary[] {
  const byRegion = new Map<string, typeof activities>();

  for (const activity of activities) {
    const regionActivities = byRegion.get(activity.location.region) ?? [];
    regionActivities.push(activity);
    byRegion.set(activity.location.region, regionActivities);
  }

  return Array.from(byRegion.entries())
    .map(([region, regionActivities]) => {
      const topCities = Array.from(new Set(regionActivities.map((activity) => activity.location.city))).slice(0, 4);
      const categories = Array.from(new Set(regionActivities.map((activity) => activity.category)));
      const regionItineraries = itineraries.filter((itinerary) => itinerary.regions.includes(region));
      const averageRating =
        Math.round(
          (regionActivities.reduce((sum, activity) => sum + getAverageRating(activity), 0) / regionActivities.length) * 10
        ) / 10;

      return {
        slug: slugifyRegion(region),
        name: region,
        description: getDestinationDescription(region, topCities, categories),
        heroImage: regionActivities.find((activity) => activity.featured)?.imageUrl ?? regionActivities[0].imageUrl,
        activityCount: regionActivities.length,
        featuredCount: regionActivities.filter((activity) => activity.featured).length,
        minPrice: Math.min(...regionActivities.map((activity) => getBestPrice(activity, "adult"))),
        topCities,
        categories,
        itineraryCount: regionItineraries.length,
        averageRating,
      };
    })
    .sort((a, b) => b.activityCount - a.activityCount);
}

export function getDestinationBySlug(slug: string) {
  const summary = getDestinationSummaries().find((destination) => destination.slug === slug);
  if (!summary) return null;

  const regionActivities = activities
    .filter((activity) => activity.location.region === summary.name)
    .sort((a, b) => getAverageRating(b) - getAverageRating(a));
  const regionItineraries = itineraries.filter((itinerary) => itinerary.regions.includes(summary.name));
  const budgetActivities = regionActivities.filter((activity) => getBestPrice(activity, "adult") <= 50).slice(0, 6);
  const featuredActivities = regionActivities.filter((activity) => activity.featured).slice(0, 8);
  const cityStats = Array.from(
    regionActivities.reduce((map, activity) => {
      const current = map.get(activity.location.city) ?? {
        city: activity.location.city,
        count: 0,
        featured: 0,
        minPrice: Infinity,
      };
      current.count += 1;
      current.featured += activity.featured ? 1 : 0;
      current.minPrice = Math.min(current.minPrice, getBestPrice(activity, "adult"));
      map.set(activity.location.city, current);
      return map;
    }, new Map<string, { city: string; count: number; featured: number; minPrice: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.featured - a.featured || b.count - a.count)
    .slice(0, 3);

  const transportHints = cityStats
    .map((city) => {
      const estimate = estimateSBBFare("Zurich", city.city);
      if (!estimate) return null;
      return {
        city: city.city,
        fromZurichTime: estimate.travelTime,
        fromZurichAdultPrice: estimate.adultPrice,
        fromZurichHalfFare: estimate.halfFarePrice,
      };
    })
    .filter(
      (
        value
      ): value is {
        city: string;
        fromZurichTime: string;
        fromZurichAdultPrice: number;
        fromZurichHalfFare: number;
      } => Boolean(value)
    );

  return {
    summary,
    activities: regionActivities,
    featuredActivities,
    budgetActivities,
    itineraries: regionItineraries,
    baseCities: cityStats,
    transportHints,
  };
}

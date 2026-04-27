import { z } from "zod";

export const seasonSchema = z.enum(["spring", "summer", "autumn", "winter"]);
export const categorySchema = z.enum(["outdoor", "culture", "adventure", "family", "wellness"]);

export const activitySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  longDescription: z.string().min(1),
  category: categorySchema,
  subcategory: z.string().min(1),
  location: z.object({
    region: z.string().min(1),
    canton: z.string().min(1),
    city: z.string().min(1),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
  }),
  seasons: z.array(seasonSchema),
  indoor: z.boolean(),
  providers: z.array(
    z.object({
      name: z.string().min(1),
      pricing: z.object({ child: z.number(), student: z.number(), adult: z.number(), senior: z.number() }),
      bookingUrl: z.string().min(1),
      rating: z.number(),
      description: z.string().optional(),
    })
  ),
  currency: z.literal("CHF"),
  duration: z.string().min(1),
  imageUrl: z.string().min(1),
  image: z.string().optional(),
  imageCredit: z
    .object({
      author: z.string().optional(),
      license: z.string().optional(),
      sourceUrl: z.string().optional(),
      filename: z.string().optional(),
    })
    .optional(),
  wikipediaTitle: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  highlights: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  tags: z.array(z.string()),
  featured: z.boolean(),
  deal: z
    .object({
      discount: z.number(),
      label: z.string(),
      validUntil: z.string(),
      providerName: z.string().optional(),
    })
    .optional(),
  trending: z.object({ score: z.number(), reason: z.string() }).optional(),
});

export const activityListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: categorySchema,
  subcategory: z.string(),
  location: z.object({
    region: z.string(),
    canton: z.string(),
    city: z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
  }),
  seasons: z.array(seasonSchema),
  indoor: z.boolean(),
  imageUrl: z.string(),
  featured: z.boolean(),
  providerCount: z.number(),
  minAdultPrice: z.number(),
});

export const storySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  date: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string()),
  content: z.string().min(1),
});

export const storyIndexItemSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
});

export const itinerarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  days: z.number().int().positive(),
  difficulty: z.enum(["Easy", "Moderate", "Active"]),
  bestSeason: z.string().min(1),
  estimatedBudget: z.object({ budget: z.string(), mid: z.string(), luxury: z.string() }),
  coverImage: z.string().min(1),
  regions: z.array(z.string()),
  tags: z.array(z.string()),
  featured: z.boolean(),
  itinerary: z.array(
    z.object({
      day: z.number().int().positive(),
      title: z.string(),
      location: z.string(),
      description: z.string(),
      activitySlugs: z.array(z.string()),
      transport: z.string().optional(),
      tip: z.string().optional(),
    })
  ),
});

export const itineraryIndexItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  duration: z.string(),
  days: z.number(),
  difficulty: z.enum(["Easy", "Moderate", "Active"]),
  bestSeason: z.string(),
  coverImage: z.string(),
  regions: z.array(z.string()),
  tags: z.array(z.string()),
  featured: z.boolean(),
  estimatedBudget: z.object({ budget: z.string(), mid: z.string(), luxury: z.string() }),
});

export type ActivityDocument = z.infer<typeof activitySchema>;
export type ActivityListItem = z.infer<typeof activityListItemSchema>;
export type StoryDocument = z.infer<typeof storySchema>;
export type StoryIndexItem = z.infer<typeof storyIndexItemSchema>;
export type ItineraryDocument = z.infer<typeof itinerarySchema>;
export type ItineraryIndexItem = z.infer<typeof itineraryIndexItemSchema>;

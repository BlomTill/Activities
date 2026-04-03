export type Season = "spring" | "summer" | "autumn" | "winter";
export type Category = "outdoor" | "culture" | "adventure" | "family" | "wellness";
export type AgeGroup = "child" | "student" | "adult" | "senior";

export interface ActivityPricing {
  child: number;
  student: number;
  adult: number;
  senior: number;
}

export interface ActivityLocation {
  region: string;
  canton: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

export interface ActivityDeal {
  discount: number;
  label: string;
  validUntil: string;
}

export interface Activity {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: Category;
  subcategory: string;
  location: ActivityLocation;
  seasons: Season[];
  indoor: boolean;
  pricing: ActivityPricing;
  currency: "CHF";
  duration: string;
  imageUrl: string;
  bookingUrl: string;
  tags: string[];
  rating: number;
  featured: boolean;
  deal?: ActivityDeal;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  content: string;
}

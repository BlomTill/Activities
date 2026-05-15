import { Category, AgeGroup } from "./types";

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "outdoor", label: "Outdoor", icon: "Mountain" },
  { value: "culture", label: "Culture", icon: "Landmark" },
  { value: "adventure", label: "Adventure", icon: "Zap" },
  { value: "family", label: "Family", icon: "Users" },
  { value: "wellness", label: "Wellness", icon: "Heart" },
];

export const AGE_GROUPS: { value: AgeGroup; label: string; description: string }[] = [
  { value: "child", label: "Child", description: "Ages 6-15" },
  { value: "student", label: "Student", description: "With valid student ID" },
  { value: "adult", label: "Adult", description: "Ages 16-64" },
  { value: "senior", label: "Senior", description: "Ages 65+" },
];

export const REGIONS = [
  "Zurich Region",
  "Bern Region",
  "Central Switzerland",
  "Eastern Switzerland",
  "Graubünden",
  "Ticino",
  "Valais",
  "Vaud",
  "Basel Region",
  "Jura & Three-Lakes",
  "Geneva Region",
  "Fribourg Region",
  "Aargau Region",
  "Solothurn Region",
  "Thurgau Region",
] as const;

/**
 * Phase 1 MVP feature flags. Routes for not-yet-polished features stay in the
 * codebase but return notFound() until their flag is explicitly turned on.
 * A flag is OFF unless its env var is exactly "on" — so unset = hidden.
 * Flip individual features back on in Phase 2 via Vercel env vars.
 */
export const FEATURE_FLAG_NAMES = [
  "PLANNER",
  "BUDGET",
  "SURPRISE",
  "ITINERARIES",
  "TRAVEL_PASSES",
  "MAP",
  "GUIDES",
  "PARTNERS",
  "DEALS",
  "REGIONS",
  "PLAN",
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAG_NAMES)[number];

// Statically reference each env var so Next.js inlines NEXT_PUBLIC_* at build.
const FEATURE_FLAG_ENV: Record<FeatureFlagName, string | undefined> = {
  PLANNER: process.env.NEXT_PUBLIC_FEATURE_PLANNER,
  BUDGET: process.env.NEXT_PUBLIC_FEATURE_BUDGET,
  SURPRISE: process.env.NEXT_PUBLIC_FEATURE_SURPRISE,
  ITINERARIES: process.env.NEXT_PUBLIC_FEATURE_ITINERARIES,
  TRAVEL_PASSES: process.env.NEXT_PUBLIC_FEATURE_TRAVEL_PASSES,
  MAP: process.env.NEXT_PUBLIC_FEATURE_MAP,
  GUIDES: process.env.NEXT_PUBLIC_FEATURE_GUIDES,
  PARTNERS: process.env.NEXT_PUBLIC_FEATURE_PARTNERS,
  DEALS: process.env.NEXT_PUBLIC_FEATURE_DEALS,
  REGIONS: process.env.NEXT_PUBLIC_FEATURE_REGIONS,
  PLAN: process.env.NEXT_PUBLIC_FEATURE_PLAN,
};

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
  return (FEATURE_FLAG_ENV[flag] ?? "off").toLowerCase() === "on";
}

/** First-path-segment → feature flag, for filtering nav/footer links. */
export const ROUTE_FLAGS: Record<string, FeatureFlagName> = {
  "/planner": "PLANNER",
  "/budget": "BUDGET",
  "/surprise": "SURPRISE",
  "/itineraries": "ITINERARIES",
  "/travel-passes": "TRAVEL_PASSES",
  "/map": "MAP",
  "/guides": "GUIDES",
  "/partners": "PARTNERS",
  "/deals": "DEALS",
  "/regions": "REGIONS",
  "/plan": "PLAN",
};

/** False when href points at a route behind an OFF feature flag. */
export function isRouteEnabled(href: string): boolean {
  const seg = "/" + (href.split(/[?#]/)[0].split("/")[1] ?? "");
  const flag = ROUTE_FLAGS[seg];
  return flag ? isFeatureEnabled(flag) : true;
}

export const SITE_NAME = "RealSwitzerland";
export const SITE_DESCRIPTION = "The independent guide to Switzerland — compare real activity prices, plan group trips, and discover hand-picked experiences across every Swiss region. Honest reviews, no fluff.";
export const SITE_URL = "https://realswitzerland.ch";
export const SITE_EMAIL = "hello@realswitzerland.ch";

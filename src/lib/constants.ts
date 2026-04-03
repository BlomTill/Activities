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
] as const;

export const SITE_NAME = "SwissActivity";
export const SITE_DESCRIPTION = "Compare costs and discover the best activities across Switzerland. Student, child, adult, and senior pricing at a glance.";
export const SITE_URL = "https://swissactivity.ch";

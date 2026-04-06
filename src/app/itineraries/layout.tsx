import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Switzerland Itineraries — Day-by-Day Trip Plans",
  description:
    "Curated Switzerland itineraries with day-by-day routes, activities, transport tips, and budget estimates. Classic 7-day tour, Bernese Oberland, budget trip, family holiday, and winter wonderland plans.",
  keywords: [
    "Switzerland itinerary",
    "Switzerland trip plan",
    "Switzerland travel route",
    "7 days Switzerland",
    "Switzerland with kids",
    "Switzerland on a budget",
    "Bernese Oberland itinerary",
  ],
};

export default function ItinerariesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Metadata } from "next";
import { gateFeature } from "@/lib/feature-gate";

export const metadata: Metadata = {
  title: "Activity Map",
  description: "Explore Swiss activities on an interactive map. Filter by category and season to find what's near you.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  gateFeature("MAP");
  return children;
}

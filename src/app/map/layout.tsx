import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Map",
  description: "Explore Swiss activities on an interactive map. Filter by category and season to find what's near you.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}

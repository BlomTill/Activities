import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Activities",
  description: "Browse and filter 55+ Swiss activities. Compare prices for students, children, adults, and seniors. Filter by category, season, and region.",
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

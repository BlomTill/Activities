import type { Metadata } from "next";
import { gateFeature } from "@/lib/feature-gate";

export const metadata: Metadata = {
  title: "Swiss Travel Passes Compared — Which One Saves You the Most?",
  description:
    "Compare Swiss Travel Pass, Half-Fare Card, and Saver Day Pass side by side. Use our calculator to find the best travel pass for your Switzerland trip and save on trains, buses, and boats.",
  keywords: [
    "Swiss Travel Pass",
    "Half-Fare Card",
    "Switzerland train pass",
    "SBB pass",
    "Swiss travel card comparison",
    "best Swiss rail pass",
  ],
};

export default function TravelPassesLayout({ children }: { children: React.ReactNode }) {
  gateFeature("TRAVEL_PASSES");
  return children;
}

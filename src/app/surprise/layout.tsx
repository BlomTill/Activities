import { Metadata } from "next";
import { gateFeature } from "@/lib/feature-gate";

export const metadata: Metadata = {
  title: "Surprise Me",
  description: "Can't decide? Let us randomly pick a seasonal Swiss activity for you. Hit the button and see where adventure takes you!",
};

export default function SurpriseLayout({ children }: { children: React.ReactNode }) {
  gateFeature("SURPRISE");
  return children;
}

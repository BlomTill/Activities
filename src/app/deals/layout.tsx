import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deals & Discounts",
  description: "Find the best deals, free activities, and budget-friendly experiences across Switzerland.",
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

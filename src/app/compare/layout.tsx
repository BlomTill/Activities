import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Activities",
  description: "Compare Swiss activities side by side. See pricing, duration, ratings, and more at a glance.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget Explorer",
  description: "Find Swiss activities within your budget. Enter how much you want to spend and see all affordable options for your age group.",
};

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return children;
}

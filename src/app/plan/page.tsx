import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Map,
  TrainFront,
  Wallet,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Plan your Swiss trip — ${SITE_NAME}`,
  description:
    "Everything you need to turn a Swiss daydream into a booked itinerary: routes, passes, budgets, and practical guides.",
};

interface Tool {
  href: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  accent: string;
}

const TOOLS: Tool[] = [
  {
    href: "/itineraries",
    title: "Itineraries",
    blurb: "Hand-built 3-10 day routes you can copy, edit, and book.",
    icon: <Calendar className="h-6 w-6" />,
    accent: "bg-red-50 text-red-700",
  },
  {
    href: "/planner",
    title: "Trip planner",
    blurb: "Drag activities onto days. See the full cost before you commit.",
    icon: <Map className="h-6 w-6" />,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    href: "/travel-passes",
    title: "Travel passes",
    blurb: "Swiss Travel Pass vs. point-to-point. Which one wins for your trip.",
    icon: <TrainFront className="h-6 w-6" />,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/budget",
    title: "Budget explorer",
    blurb: "A week in Switzerland, broken down by spending style.",
    icon: <Wallet className="h-6 w-6" />,
    accent: "bg-amber-50 text-amber-700",
  },
  {
    href: "/guides",
    title: "Planning guides",
    blurb: "Practical essays on rail, seasons, money, and logistics.",
    icon: <BookOpen className="h-6 w-6" />,
    accent: "bg-stone-100 text-stone-700",
  },
  {
    href: "/surprise",
    title: "Surprise me",
    blurb: "One click, one unexpected idea. Perfect for stuck travellers.",
    icon: <Sparkles className="h-6 w-6" />,
    accent: "bg-purple-50 text-purple-700",
  },
];

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-14 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 mb-4">
          Plan
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
          The boring stuff, done well.
        </h1>
        <p className="mt-3 text-lg text-gray-600 leading-relaxed">
          Switzerland is expensive and timetabled to the minute — which is why
          the planning matters. These tools do the math for you.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-gray-200 p-6 transition-all hover:border-gray-900 hover:shadow-md"
          >
            <div className={`inline-flex rounded-xl ${t.accent} p-3 mb-4`}>
              {t.icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              {t.blurb}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700 group-hover:gap-2 transition-all">
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, TrainFront, Wallet, Sun, Snowflake } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Guides — ${SITE_NAME}`,
  description:
    "Practical, no-fluff planning guides for Switzerland: rail passes, budgeting, seasons, and logistics.",
};

interface Guide {
  slug: string;
  title: string;
  kicker: string;
  readMin: number;
  icon: React.ReactNode;
  href: string;
  live: boolean;
}

const GUIDES: Guide[] = [
  {
    slug: "swiss-travel-pass",
    title: "Swiss Travel Pass, fully explained",
    kicker: "Rail & transport",
    readMin: 8,
    icon: <TrainFront className="h-6 w-6" />,
    href: "/travel-passes",
    live: true,
  },
  {
    slug: "budget-switzerland",
    title: "How to afford Switzerland",
    kicker: "Money",
    readMin: 10,
    icon: <Wallet className="h-6 w-6" />,
    href: "/budget",
    live: true,
  },
  {
    slug: "best-time-to-visit",
    title: "When should you actually visit?",
    kicker: "Seasons",
    readMin: 6,
    icon: <Sun className="h-6 w-6" />,
    href: "/guides/best-time-to-visit",
    live: false,
  },
  {
    slug: "winter-first-timer",
    title: "Your first Swiss winter, step by step",
    kicker: "Winter",
    readMin: 12,
    icon: <Snowflake className="h-6 w-6" />,
    href: "/guides/winter-first-timer",
    live: false,
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          Planning guides
        </div>
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          The practical stuff, explained clearly.
        </h1>
        <p className="mt-3 text-lg text-gray-600 leading-relaxed">
          Rail passes, money, seasons, and logistics — written so you can
          stop Googling and start booking.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {GUIDES.map((g) =>
          g.live ? (
            <Link
              key={g.slug}
              href={g.href}
              className="group rounded-2xl border border-gray-200 p-6 transition hover:border-gray-900 hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-xl bg-gray-100 p-3 text-gray-700 group-hover:bg-gray-900 group-hover:text-white transition">
                  {g.icon}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {g.readMin} min
                </div>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {g.kicker}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {g.title}
              </h2>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 group-hover:text-red-700">
                Read guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ) : (
            <div
              key={g.slug}
              className="relative rounded-2xl border border-dashed border-gray-300 p-6 opacity-70"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-xl bg-gray-100 p-3 text-gray-500">
                  {g.icon}
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  Coming soon
                </span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {g.kicker}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {g.title}
              </h2>
              <p className="text-sm text-gray-500">
                We&apos;re writing this now. Join the newsletter to know
                when it drops.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

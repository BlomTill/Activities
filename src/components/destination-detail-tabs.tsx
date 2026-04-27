"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity-card";
import { DestinationSeasonHighlights } from "@/components/destination-season-highlights";
import type { Activity, BlogPost } from "@/lib/types";
import type { ItineraryDocument } from "@/lib/content/schemas";

type TabKey = "itineraries" | "planning" | "budget" | "guides" | "seasons";

export function DestinationDetailTabs({
  itineraries,
  baseCities,
  transportHints,
  budgetActivities,
  relatedPosts,
  allActivities,
  initialSeason,
}: {
  itineraries: ItineraryDocument[];
  baseCities: Array<{ city: string; count: number; featured: number; minPrice: number }>;
  transportHints: Array<{ city: string; fromZurichTime: string; fromZurichAdultPrice: number; fromZurichHalfFare: number }>;
  budgetActivities: Activity[];
  relatedPosts: BlogPost[];
  allActivities: Activity[];
  initialSeason?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>(itineraries.length > 0 ? "itineraries" : "planning");

  const tabs: Array<{ key: TabKey; label: string }> = [
    ...(itineraries.length > 0 ? [{ key: "itineraries" as const, label: "Itineraries" }] : []),
    { key: "planning" as const, label: "Planning" },
    ...(budgetActivities.length > 0 ? [{ key: "budget" as const, label: "Budget Picks" }] : []),
    ...(relatedPosts.length > 0 ? [{ key: "guides" as const, label: "Guides" }] : []),
    { key: "seasons" as const, label: "By Season" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "itineraries" && itineraries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {itineraries.map((itinerary) => (
            <Link key={itinerary.id} href={`/itineraries/${itinerary.slug}`} className="rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-50 text-red-700">{itinerary.duration}</Badge>
                <Badge variant="secondary">{itinerary.difficulty}</Badge>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">{itinerary.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{itinerary.description}</p>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "planning" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Suggested base cities</h2>
            <div className="mt-5 space-y-3">
              {baseCities.map((city) => (
                <div key={city.city} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{city.city}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {city.count} activities nearby{city.featured > 0 ? ` • ${city.featured} featured pick${city.featured > 1 ? "s" : ""}` : ""}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-gray-900">{city.minPrice === 0 ? "Free" : `from CHF ${city.minPrice}`}</p>
                      <p className="text-gray-400">entry point</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Getting here by train</h2>
            <div className="mt-5 space-y-3">
              {transportHints.map((hint) => (
                <div key={hint.city} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4 text-red-600" />
                        <p className="font-semibold text-gray-900">Zurich to {hint.city}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Typical train time: {hint.fromZurichTime}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-gray-900">CHF {hint.fromZurichAdultPrice}</p>
                      <p className="text-green-600">CHF {hint.fromZurichHalfFare} with Half-Fare</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400">
              These are simplified planning estimates, not exact ticket quotes.
            </p>
          </div>
        </div>
      )}

      {activeTab === "budget" && budgetActivities.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Affordable picks</h2>
              <p className="mt-1 text-gray-500">A low-friction starting list for budget-conscious travelers.</p>
            </div>
            <Link href="/budget?budget=50&season=current">
              <Button variant="ghost" className="gap-1 text-red-600">Open budget explorer <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {budgetActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "guides" && relatedPosts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {relatedPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{post.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "seasons" && (
        <DestinationSeasonHighlights activities={allActivities} initialSeason={initialSeason} />
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Mountain, Wallet, Calendar, ArrowLeft, Train, Lightbulb, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getItineraryBySlug } from "@/lib/content/selectors";
import { getActivityBySlug } from "@/lib/content/selectors";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getBestPrice } from "@/lib/types";
import { useAgeGroup } from "@/context/age-group-context";
import { encodePlannerPlan } from "@/lib/trip-tools";
import { getRelatedBlogPostsForActivities } from "@/lib/blog";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Moderate: "bg-amber-100 text-amber-800",
  Active: "bg-red-100 text-red-800",
};
type ItineraryTab = "days" | "budget" | "guides";

export default function ItineraryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const itinerary = getItineraryBySlug(slug);
  const { ageGroup } = useAgeGroup();
  const [activeTab, setActiveTab] = useState<ItineraryTab>("days");

  if (!itinerary) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Itinerary not found</h1>
          <Link href="/itineraries">
            <Button className="mt-4">Back to Itineraries</Button>
          </Link>
        </div>
      </div>
    );
  }

  const plannerPlan = encodePlannerPlan(
    itinerary.itinerary.map((day) =>
      day.activitySlugs
        .map((activitySlug) => getActivityBySlug(activitySlug)?.id)
        .filter((id): id is string => Boolean(id))
    )
  );
  const linkedActivities = itinerary.itinerary.flatMap((day) =>
    day.activitySlugs
      .map((activitySlug) => getActivityBySlug(activitySlug))
      .filter((activity): activity is NonNullable<ReturnType<typeof getActivityBySlug>> => Boolean(activity))
  );
  const estimatedActivitiesCost = linkedActivities.reduce((sum, activity) => sum + (getBestPrice(activity, ageGroup) ?? 0), 0);
  const uniqueCities = Array.from(new Set(itinerary.itinerary.map((day) => day.location)));
  const relatedPosts = getRelatedBlogPostsForActivities(linkedActivities, [...itinerary.tags, ...itinerary.regions]);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 md:h-96">
        <Image
          src={itinerary.coverImage}
          alt={itinerary.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-5xl">
            <Link href="/itineraries" className="text-white/80 hover:text-white text-sm flex items-center gap-1 mb-3">
              <ArrowLeft className="h-4 w-4" /> All Itineraries
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={DIFFICULTY_COLORS[itinerary.difficulty]}>{itinerary.difficulty}</Badge>
              <Badge className="bg-white/20 text-white border-white/30">{itinerary.duration}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{itinerary.title}</h1>
            <p className="text-white/80 mt-1 text-lg">{itinerary.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" /> {itinerary.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-400" /> Best: {itinerary.bestSeason}
          </span>
          <span className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-gray-400" /> Budget: {itinerary.estimatedBudget.budget} | Mid: {itinerary.estimatedBudget.mid}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="h-4 w-4 text-gray-400" /> {itinerary.regions.join(", ")}
          </span>
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-gray-700 text-lg leading-relaxed">{itinerary.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Linked activity spend</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">CHF {estimatedActivitiesCost}</p>
            <p className="mt-1 text-xs text-gray-400">Based on current {ageGroup} pricing for the listed activities.</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Cities on this route</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{uniqueCities.length}</p>
            <p className="mt-1 text-xs text-gray-400">{uniqueCities.slice(0, 4).join(", ")}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Best next step</p>
            <p className="mt-1 text-base font-semibold text-gray-900">Open it in the planner</p>
            <p className="mt-1 text-xs text-gray-400">Turn this route into something you can edit and share.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/planner?days=${itinerary.days}&budget=${estimatedActivitiesCost || 120}&plan=${encodeURIComponent(plannerPlan)}`}>
            <Button className="bg-red-600 hover:bg-red-700 gap-2">
              Open This Itinerary in Planner
            </Button>
          </Link>
          <Link href={`/travel-passes?tripDays=${itinerary.days}&travelDays=${Math.max(1, itinerary.days - 2)}`}>
            <Button variant="outline" className="gap-2">
              <Train className="h-4 w-4" /> Match a Travel Pass
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("days")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "days" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Day Plan
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "budget" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Budget & Passes
          </button>
          {relatedPosts.length > 0 && (
            <button
              onClick={() => setActiveTab("guides")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "guides" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Guides
            </button>
          )}
        </div>

        {activeTab === "days" && (
          <div className="space-y-4">
            {itinerary.itinerary.map((day) => {
              const linkedActivities = day.activitySlugs
                .map((s) => getActivityBySlug(s))
                .filter(Boolean);

              return (
                <Card key={day.day} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="flex-shrink-0 w-16 bg-red-600 text-white flex flex-col items-center justify-center">
                        <span className="text-xs uppercase font-medium">Day</span>
                        <span className="text-2xl font-bold">{day.day}</span>
                      </div>

                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{day.title}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {day.location}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{day.description}</p>

                        {day.transport && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-blue-700 bg-blue-50 rounded-md px-2 py-1.5">
                            <Train className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            {day.transport}
                          </div>
                        )}

                        {day.tip && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-md px-2 py-1.5">
                            <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            {day.tip}
                          </div>
                        )}

                        {linkedActivities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {linkedActivities.map((act) => {
                              if (!act) return null;
                              const price = getBestPrice(act, ageGroup);
                              return (
                                <Link
                                  key={act.id}
                                  href={`/activities/${act.slug}`}
                                  className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
                                >
                                  <span className="font-medium text-gray-900">{act.name}</span>
                                  <span className="text-gray-400">|</span>
                                  <span className="font-semibold text-red-600">
                                    {price === null ? "Check price" : price === 0 ? "Free" : `CHF ${price}`}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-gray-400" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "budget" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Budget</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">{itinerary.estimatedBudget.budget}</div>
                  <div className="text-xs text-gray-400 mt-1">Hostels, self-catering, free activities</div>
                </CardContent>
              </Card>
              <Card className="ring-2 ring-red-200">
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Mid-Range</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{itinerary.estimatedBudget.mid}</div>
                  <div className="text-xs text-gray-400 mt-1">3-star hotels, dining out, most activities</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Luxury</div>
                  <div className="text-2xl font-bold text-purple-700 mt-1">{itinerary.estimatedBudget.luxury}</div>
                  <div className="text-xs text-gray-400 mt-1">4-5 star, fine dining, all premium activities</div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900">Need a travel pass for this trip?</h2>
              <p className="mt-2 text-sm text-gray-500">
                Compare Swiss Travel Pass, Half-Fare Card, and more to find the best deal for your {itinerary.duration} trip.
              </p>
              <Link href={`/travel-passes?tripDays=${itinerary.days}&travelDays=${Math.max(1, itinerary.days - 2)}`}>
                <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 rounded-full gap-1">
                  <Train className="h-4 w-4" /> Compare Travel Passes
                </Button>
              </Link>
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
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <NewsletterSignup
          variant="banner"
          intent="itinerary"
          title={`Get more itineraries like ${itinerary.title}`}
          description="We’ll send route ideas, budget-friendly swaps, and planning prompts for multi-day Switzerland trips."
        />
      </section>
    </div>
  );
}

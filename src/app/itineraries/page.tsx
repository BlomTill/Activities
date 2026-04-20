"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Mountain, Wallet, ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { itineraries } from "@/data/itineraries";
import { getDestinationSummaries } from "@/lib/destinations";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-100 text-green-800",
  Moderate: "bg-amber-100 text-amber-800",
  Active: "bg-red-100 text-red-800",
};

export default function ItinerariesPage() {
  const destinations = getDestinationSummaries().slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm">
            <MapPin className="h-4 w-4 mr-1" /> Curated Trip Plans
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Switzerland Itineraries
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Ready-made trip plans with day-by-day routes, activities, transport tips,
            and budget estimates. Pick a plan and go.
          </p>
        </div>
      </section>

      {/* Itinerary Cards */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {itineraries.map((itin) => (
            <Link key={itin.id} href={`/itineraries/${itin.slug}`}>
              <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={itin.coverImage}
                    alt={itin.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className={DIFFICULTY_COLORS[itin.difficulty]}>
                      {itin.difficulty}
                    </Badge>
                    {itin.featured && (
                      <Badge className="bg-red-600 text-white">Featured</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-xl font-bold">{itin.title}</h3>
                    <p className="text-sm text-white/80 mt-0.5">{itin.subtitle}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{itin.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {itin.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {itin.bestSeason}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5" /> from {itin.estimatedBudget.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mountain className="h-3.5 w-3.5" /> {itin.regions.length} regions
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {itin.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start from a destination</h2>
            <p className="mt-2 text-gray-500">If you know the region first, it’s easier to choose the right itinerary.</p>
          </div>
          <Link href="/destinations">
            <Button variant="ghost" className="gap-1 text-red-600">
              All destinations <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <Link key={destination.slug} href={`/destinations/${destination.slug}`} className="rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md">
              <p className="text-sm font-medium text-red-600">{destination.name}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">{destination.description}</p>
              <p className="mt-3 text-xs text-gray-400">
                {destination.activityCount} activities • {destination.itineraryCount} itineraries
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Not sure where to start?</h2>
          <p className="mt-2 text-gray-500">
            Use our Budget Explorer to find activities that fit your price range,
            or browse all 150+ activities across Switzerland.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/budget">
              <Button className="bg-red-600 hover:bg-red-700 rounded-full gap-1">
                <Wallet className="h-4 w-4" /> Budget Explorer
              </Button>
            </Link>
            <Link href="/activities">
              <Button variant="outline" className="rounded-full gap-1">
                All Activities <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <NewsletterSignup
          variant="banner"
          intent="itinerary"
          title="Get itinerary-ready Swiss trip ideas"
          description="Receive route ideas, budget-friendly swaps, and travel-pass prompts based on the kind of Swiss trip you want to build."
        />
      </section>
    </div>
  );
}

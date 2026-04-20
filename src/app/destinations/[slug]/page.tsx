import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Route, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { DestinationDetailTabs } from "@/components/destination-detail-tabs";
import { getDestinationBySlug, getDestinationSummaries } from "@/lib/destinations";
import { getRelatedBlogPostsForDestination } from "@/lib/blog";

export function generateStaticParams() {
  return getDestinationSummaries().map((destination) => ({ slug: destination.slug }));
}

export default function DestinationDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { season?: string };
}) {
  const destination = getDestinationBySlug(params.slug);

  if (!destination) {
    notFound();
  }

  const { summary, featuredActivities, budgetActivities, itineraries, baseCities, transportHints } = destination;
  const relatedPosts = getRelatedBlogPostsForDestination(
    summary.name,
    summary.topCities,
    summary.categories,
    ["spring", "summer", "autumn", "winter"]
  );

  return (
    <div>
      <section className="relative h-[360px] overflow-hidden md:h-[420px]">
        <Image src={summary.heroImage} alt={summary.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 py-8 text-white md:py-12">
            <Badge className="border-white/30 bg-white/20 text-white">Destination Guide</Badge>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">{summary.name}</h1>
            <p className="mt-3 max-w-3xl text-lg text-white/85">{summary.description}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/80">
              <span className="rounded-full bg-white/15 px-3 py-1">{summary.activityCount} activities</span>
              <span className="rounded-full bg-white/15 px-3 py-1">{summary.topCities.join(", ")}</span>
              <span className="rounded-full bg-white/15 px-3 py-1">from {summary.minPrice === 0 ? "Free" : `CHF ${summary.minPrice}`}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Fastest way to plan this region</h3>
            <div className="mt-4 space-y-3">
              <Link href={`/planner?days=${itineraries[0]?.days || 3}&budget=${summary.minPrice === 0 ? 80 : Math.max(120, summary.minPrice * 2)}`}>
                <Button className="w-full justify-between bg-red-600 hover:bg-red-700">
                  Start a {summary.name} trip
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/budget?budget=${summary.minPrice === 0 ? 50 : Math.max(50, summary.minPrice)}&season=current`}>
                <Button variant="outline" className="w-full justify-between">
                  Find affordable picks here
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/travel-passes?tripDays=4&travelDays=3">
                <Button variant="outline" className="w-full justify-between">
                  Compare transport passes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900">Top recommendations first</h2>
            <p className="mt-2 text-gray-500">Start with the strongest picks here, then open the tabs below for planning details.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <MapPin className="h-5 w-5 text-red-600" />
                <p className="mt-3 font-medium text-gray-900">Top cities</p>
                <p className="mt-1 text-sm text-gray-500">{summary.topCities.join(", ")}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <Wallet className="h-5 w-5 text-green-600" />
                <p className="mt-3 font-medium text-gray-900">Budget entry point</p>
                <p className="mt-1 text-sm text-gray-500">
                  {summary.minPrice === 0 ? "Free picks available" : `Trips can start from CHF ${summary.minPrice}`}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <Route className="h-5 w-5 text-sky-600" />
                <p className="mt-3 font-medium text-gray-900">Trip-ready</p>
                <p className="mt-1 text-sm text-gray-500">
                  {itineraries.length > 0 ? `${itineraries.length} itinerary option${itineraries.length > 1 ? "s" : ""}` : "Mix and match your own route"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-gray-900">Recommended first picks</h2>
          <p className="mt-2 text-gray-500">Keep the best options visible first. Open the tabs below only when you want more detail.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </section>

      <DestinationDetailTabs
        itineraries={itineraries}
        baseCities={baseCities}
        transportHints={transportHints}
        budgetActivities={budgetActivities}
        relatedPosts={relatedPosts}
        allActivities={destination.activities}
        initialSeason={searchParams?.season}
      />

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <NewsletterSignup
          variant="banner"
          intent="region"
          title={`Get better ideas for ${summary.name}`}
          description={`We’ll send trip-ready picks, budget ideas, and itinerary suggestions for ${summary.name} instead of generic travel email.`}
        />
      </section>
    </div>
  );
}

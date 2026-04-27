import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getDestinationSummaries } from "@/lib/destinations";
import { DestinationBrowser } from "@/components/destination-browser";
import { activities } from "@/lib/content/selectors";
import { Season } from "@/lib/types";

export default function DestinationsPage() {
  const destinations = getDestinationSummaries();
  const seasonActivityCounts = destinations.reduce<Record<string, Record<Season, number>>>((acc, destination) => {
    const regionActivities = activities.filter((activity) => activity.location.region === destination.name);
    acc[destination.name] = {
      spring: regionActivities.filter((activity) => activity.seasons.includes("spring")).length,
      summer: regionActivities.filter((activity) => activity.seasons.includes("summer")).length,
      autumn: regionActivities.filter((activity) => activity.seasons.includes("autumn")).length,
      winter: regionActivities.filter((activity) => activity.seasons.includes("winter")).length,
    };
    return acc;
  }, {});

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-700 via-cyan-700 to-emerald-700 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center text-white">
          <Badge className="mb-4 border-white/30 bg-white/20 text-white text-sm">
            <MapPin className="mr-1 h-4 w-4" /> Explore by region
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Switzerland Destinations</h1>
          <p className="mt-4 text-lg text-white/90">
            Start with the region that fits your trip style, then jump into activities, itineraries, and budget-friendly ideas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <DestinationBrowser destinations={destinations} seasonActivityCounts={seasonActivityCounts} />
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <NewsletterSignup
          variant="banner"
          intent="destinations"
          title="Get destination-specific ideas"
          description="Tell us which Swiss region you want to explore and we’ll send trip-ready picks, not generic newsletters."
        />
        <div className="mt-6 text-center">
          <Link href="/planner">
            <Button className="rounded-full bg-red-600 hover:bg-red-700">Start Planning a Trip</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

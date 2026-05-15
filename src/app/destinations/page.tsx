import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { MVP_DESTINATIONS } from "@/lib/mvp-destinations";
import { mvpActivities } from "@/lib/content/selectors";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Switzerland Destinations — 5 Places, Every Tour Compared",
  description:
    "Zurich, Lucerne, Interlaken, Zermatt and Geneva — compare activities, tours and tickets across every marketplace, with real starting prices and no markup.",
};

export default function DestinationsPage() {
  const counts = new Map<string, number>();
  for (const a of mvpActivities) {
    if (a.mvpDestination) counts.set(a.mvpDestination, (counts.get(a.mvpDestination) ?? 0) + 1);
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-700 via-cyan-700 to-emerald-700 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center text-white">
          <Badge className="mb-4 border-white/30 bg-white/20 text-white text-sm">
            <MapPin className="mr-1 h-4 w-4" /> 5 destinations
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Switzerland Destinations</h1>
          <p className="mt-4 text-lg text-white/90">
            Five bases that cover the best of Switzerland. Pick one to compare every tour,
            ticket and activity worth booking there — real prices, no markup.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MVP_DESTINATIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                <Image
                  src={d.heroImage}
                  alt={d.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold">{d.name}</h2>
                  <p className="text-sm text-white/85">{d.tagline}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-gray-900">
                  {counts.get(d.name) ?? 0} activities compared
                </span>
                <span className="font-semibold text-red-600 group-hover:underline">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <NewsletterSignup
          variant="banner"
          intent="destinations"
          title="Get destination-specific ideas"
          description={`Tell us which Swiss base you're planning around and ${SITE_NAME} will send trip-ready picks, not generic newsletters.`}
        />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { MVP_DESTINATIONS, getMvpDestinationData } from "@/lib/mvp-destinations";
import { SITE_NAME } from "@/lib/constants";

export function generateStaticParams() {
  return MVP_DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const data = getMvpDestinationData(params.slug);
  if (!data) return { title: "Destination not found" };
  const { destination, activities } = data;
  return {
    title: `Things to do in ${destination.name} | ${activities.length}+ tours compared | ${SITE_NAME}`,
    description: destination.intro.slice(0, 155),
    alternates: { canonical: `/destinations/${destination.slug}` },
  };
}

export default function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const data = getMvpDestinationData(params.slug);
  if (!data) notFound();
  const { destination, activities, stories } = data;
  const top = activities.slice(0, 20);

  return (
    <div>
      <section className="relative h-[360px] overflow-hidden md:h-[440px]">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 py-8 text-white md:py-12">
            <Badge className="border-white/30 bg-white/20 text-white">Destination guide</Badge>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">{destination.name}</h1>
            <p className="mt-2 max-w-2xl text-lg text-white/90">{destination.tagline}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-[15px] leading-7 text-gray-600">{destination.intro}</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Top {top.length} activities in {destination.name}
          </h2>
          <Link
            href={`/activities?destination=${destination.name}`}
            className="shrink-0 text-sm font-semibold text-red-600 hover:underline"
          >
            See all {activities.length} →
          </Link>
        </div>
        {top.length === 0 ? (
          <p className="mt-6 text-gray-500">No activities are listed for this destination yet.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        )}
      </section>

      {stories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900">Read more</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {stories.map((s) => (
              <Link
                key={s.slug}
                href={`/stories/${s.slug}`}
                className="group flex items-center justify-between gap-3 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-600">{s.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{s.excerpt}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <NewsletterSignup
          variant="banner"
          intent="region"
          title={`Planning a ${destination.name} trip?`}
          description={`Get ${destination.name}-focused activity picks and price drops from ${SITE_NAME}.`}
        />
      </section>
    </div>
  );
}

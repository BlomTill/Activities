import { Suspense } from "react";
import { activities } from "@/lib/content/selectors";
import { ActivitiesBrowser } from "@/components/activities-browser";

/**
 * /activities — Server component.
 *
 * Reads the full activities list once on the server, sends down a
 * lightweight projection (no longDescription / gallery / coordinates),
 * and lets the client island handle filtering, paging, and rendering.
 *
 * This used to ship ~1.5MB of JSON to every visitor. The slim
 * projection is ~250KB gzipped.
 */
export default function ActivitiesPage() {
  const slim = activities.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.description,
    category: a.category,
    subcategory: a.subcategory,
    location: {
      region: a.location.region,
      city: a.location.city,
    },
    seasons: a.seasons,
    indoor: a.indoor,
    duration: a.duration,
    tags: a.tags,
    featured: a.featured,
    pricing: a.providers[0]?.pricing ?? { child: 0, student: 0, adult: 0, senior: 0 },
    minPrice: Math.min(...a.providers.map((p) => p.pricing.adult)),
    rating: a.providers.reduce((s, p) => s + p.rating, 0) / a.providers.length,
    providersCount: a.providers.length,
    image: a.image,
    imageUrl: a.imageUrl,
  }));

  return (
    <Suspense fallback={<div className="p-16 text-center text-[var(--ink-mute,#7E8B92)]">Loading activities…</div>}>
      <ActivitiesBrowser activities={slim} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivityBySlug, activities } from "@/lib/content/selectors";
import { ActivityJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { resolveActivityImage } from "@/lib/images";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ActivityDetail } from "./activity-detail";

/**
 * /activities/[slug] — server shell.
 *
 * Generates per-activity metadata (title, description, OG image), embeds
 * structured data on the server, and hands the interactive UI off to a
 * client island. Pre-rendering the whole catalogue with
 * generateStaticParams keeps page TTFB low and gives Google all 1,500+
 * detail pages with proper SEO out of the box.
 */
export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }));
}

export function generateMetadata(
  { params }: { params: { slug: string } }
): Metadata {
  const activity = getActivityBySlug(params.slug);
  if (!activity) return { title: "Activity not found" };

  const image = resolveActivityImage(activity);
  const title = `${activity.name} — ${activity.location.city}, Switzerland`;
  const description = activity.description;
  const url = `${SITE_URL}/activities/${activity.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: SITE_NAME,
      images: image.src
        ? [{ url: image.src, alt: image.alt, width: 1200, height: 800 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image.src ? [image.src] : undefined,
    },
  };
}

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const activity = getActivityBySlug(params.slug);
  if (!activity) notFound();

  return (
    <>
      <ActivityJsonLd activity={activity} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "Activities", url: "/activities" },
        { name: activity.category, url: `/activities?category=${activity.category}` },
        { name: activity.name, url: `/activities/${activity.slug}` },
      ]} />
      <ActivityDetail activity={activity} />
    </>
  );
}

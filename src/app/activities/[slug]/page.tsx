import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivityBySlug, mvpActivities } from "@/lib/content/selectors";
import { ActivityJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { resolveActivityImage } from "@/lib/images";
import { getBestPrice } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ActivityDetail } from "./activity-detail";

/**
 * /activities/[slug] — server shell.
 *
 * Prerender ONLY the ~200 MVP activities at build time (keeps the build
 * well under Vercel's cap and matches the indexable set — see
 * MVP_LAUNCH_PLAN.md risk #5). dynamicParams=true means the other ~1,300
 * detail pages still render on-demand (ISR) when deep-linked, so no
 * affiliate link breaks.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return mvpActivities.map((a) => ({ slug: a.slug }));
}

export function generateMetadata(
  { params }: { params: { slug: string } }
): Metadata {
  const activity = getActivityBySlug(params.slug);
  if (!activity) return { title: "Activity not found" };

  const image = resolveActivityImage(activity);
  const price = getBestPrice(activity, "adult");
  const titleText =
    price !== null && price > 0
      ? `${activity.name} from CHF ${price} | realswitzerland.ch`
      : `${activity.name} | realswitzerland.ch`;
  const title = { absolute: titleText };
  const description = activity.description;
  const url = `${SITE_URL}/activities/${activity.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: titleText,
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
      title: titleText,
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

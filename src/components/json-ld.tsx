import { Activity, getAverageRating } from "@/lib/types";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { resolveActivityImage } from "@/lib/images";

export function ActivityJsonLd({ activity }: { activity: Activity }) {
  const pricedProviders = activity.providers ?? [];
  const allPrices = pricedProviders.flatMap((p) => Object.values(p.pricing));
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;
  const avgRating = getAverageRating(activity);
  const resolvedImage = resolveActivityImage(activity);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: activity.name,
    description: activity.description,
    url: `${SITE_URL}/activities/${activity.slug}`,
    image: resolvedImage.src,
    address: {
      "@type": "PostalAddress",
      addressLocality: activity.location.city,
      addressRegion: activity.location.canton,
      addressCountry: "CH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: activity.location.coordinates.lat,
      longitude: activity.location.coordinates.lng,
    },
    touristType: activity.tags,
  };

  if (avgRating !== null) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      bestRating: 5,
      ratingCount: Math.floor(avgRating * 50),
    };
  }

  if (minPrice !== null && maxPrice !== null && pricedProviders.length > 0) {
    jsonLd.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "CHF",
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: pricedProviders.length,
    };
    jsonLd.isAccessibleForFree = minPrice === 0;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Compare costs and discover the best activities across Switzerland.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/activities?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

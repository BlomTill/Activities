"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star, ExternalLink, Calendar, Home, Scale, Check, Users, Sparkles, CloudSun, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityBySlug, activities } from "@/data/activities";
import { useAgeGroup } from "@/context/age-group-context";
import { useComparison } from "@/context/comparison-context";
import { AGE_GROUPS } from "@/lib/constants";
import { ActivityCard } from "@/components/activity-card";
import { getSeasonLabel } from "@/lib/seasons";
import { WeatherWidget } from "@/components/weather-widget";
import { SBBEstimator } from "@/components/sbb-estimator";
import { ActivityJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
import { getBestPrice, getAverageRating, getCheapestProvider, getBestRatedProvider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getAffiliateUrl } from "@/lib/affiliate";
import { getPlannerBudgetHint, getProviderRecommendation, getRecommendedTripDays } from "@/lib/trip-tools";
import { RecentlyViewed, saveRecentlyViewedActivity } from "@/components/recently-viewed";

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    outdoor: "bg-green-100 text-green-800",
    culture: "bg-purple-100 text-purple-800",
    adventure: "bg-orange-100 text-orange-800",
    family: "bg-blue-100 text-blue-800",
    wellness: "bg-pink-100 text-pink-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
}

type ActivityTab = "providers" | "planning" | "details";

export default function ActivityDetailPage() {
  const params = useParams();
  const activity = getActivityBySlug(params.slug as string);
  const { ageGroup } = useAgeGroup();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const [activeTab, setActiveTab] = useState<ActivityTab>("providers");

  useEffect(() => {
    if (!activity) return;
    saveRecentlyViewedActivity(activity.id);
  }, [activity]);

  if (!activity) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Activity not found</h1>
        <Link href="/activities"><Button className="mt-4">Back to Activities</Button></Link>
      </div>
    );
  }

  const inComparison = isInComparison(activity.id);
  const rating = getAverageRating(activity);
  const bestPrice = getBestPrice(activity, ageGroup);
  const cheapest = getCheapestProvider(activity, ageGroup);
  const bestRated = getBestRatedProvider(activity);
  const recommendedProvider = getProviderRecommendation(activity, ageGroup);
  const plannerHref = `/planner?days=${getRecommendedTripDays(activity)}&budget=${getPlannerBudgetHint(activity, ageGroup)}&ageGroup=${ageGroup}&activity=${activity.slug}`;
  const similar = activities
    .filter((a) => a.id !== activity.id && (a.category === activity.category || a.location.region === activity.location.region))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ActivityJsonLd activity={activity} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "/" },
        { name: "Activities", url: "/activities" },
        { name: activity.category, url: `/activities?category=${activity.category}` },
        { name: activity.name, url: `/activities/${activity.slug}` },
      ]} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-red-600"><Home className="h-4 w-4" /></Link>
        <span>/</span>
        <Link href="/activities" className="hover:text-red-600">Activities</Link>
        <span>/</span>
        <Link href={`/activities?category=${activity.category}`} className="hover:text-red-600 capitalize">{activity.category}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{activity.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-200 mb-4">
            <Image src={activity.imageUrl} alt={activity.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <Badge className={cn("text-sm", getCategoryColor(activity.category))}>{activity.category}</Badge>
              {activity.deal && <Badge className="bg-red-600 text-white text-sm">{activity.deal.label}</Badge>}
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-end justify-between gap-3">
              <div className="rounded-2xl bg-white/92 px-4 py-3 shadow-lg backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Recommended booking</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{recommendedProvider.provider.name}</p>
                <p className="text-sm text-gray-500">{recommendedProvider.label}</p>
              </div>
              <div className="rounded-2xl bg-white/92 px-4 py-3 text-right shadow-lg backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Best price</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{bestPrice === 0 ? "Free" : `CHF ${bestPrice}`}</p>
              </div>
            </div>
          </div>
          {activity.gallery && activity.gallery.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {activity.gallery.map((img, i) => (
                <div key={i} className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  <Image src={img} alt={`${activity.name} ${i + 1}`} fill className="object-cover" sizes="128px" />
                </div>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{activity.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{activity.location.city}, {activity.location.canton}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{activity.duration}</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{rating} / 5</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{activity.seasons.map(getSeasonLabel).join(", ")}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{activity.providers.length} provider{activity.providers.length > 1 ? "s" : ""}</span>
          </div>

          {/* Quick Highlights */}
          {activity.highlights && activity.highlights.length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {activity.highlights.map((h) => (
                <div key={h.label} className="rounded-lg border bg-gray-50 px-3 py-2.5 text-center">
                  <p className="text-sm font-bold text-gray-900">{h.value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{h.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-[28px] border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "providers", label: "Compare Providers" },
                { key: "planning", label: "Plan This Activity" },
                { key: "details", label: "Details & Seasons" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as ActivityTab)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === tab.key ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "providers" && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-gray-900">Compare {activity.providers.length} provider{activity.providers.length > 1 ? "s" : ""}</h2>
                <p className="mt-2 text-gray-500">Prices shown for <span className="font-medium capitalize text-red-600">{ageGroup}</span>. Best recommendation stays highlighted.</p>
                <div className="mt-6 mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-red-600 text-white">{recommendedProvider.label}</Badge>
                    <span className="text-sm font-semibold text-gray-900">{recommendedProvider.provider.name}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{recommendedProvider.reason}</p>
                </div>
                <div className="space-y-4">
                  {activity.providers
                    .sort((a, b) => a.pricing[ageGroup] - b.pricing[ageGroup])
                    .map((provider) => {
                      const isCheapest = provider.name === cheapest.name;
                      const isBestRated = provider.name === bestRated.name && activity.providers.length > 1;
                      const isRecommended = provider.name === recommendedProvider.provider.name;
                      return (
                        <div
                          key={provider.name}
                          className={cn(
                            "rounded-2xl border p-5 transition-all hover:shadow-md",
                            isRecommended
                              ? "border-red-200 bg-red-50/50"
                              : isCheapest && activity.providers.length > 1
                                ? "border-green-200 bg-green-50/50"
                                : "bg-white"
                          )}
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                                {isCheapest && activity.providers.length > 1 && <Badge className="bg-green-100 text-green-800 text-[10px]">Best Price</Badge>}
                                {isBestRated && <Badge className="bg-amber-100 text-amber-800 text-[10px]">Top Rated</Badge>}
                                {isRecommended && <Badge className="bg-red-100 text-red-800 text-[10px]">{recommendedProvider.label}</Badge>}
                              </div>
                              {provider.description && <p className="mt-1 text-sm text-gray-500">{provider.description}</p>}
                              <div className="mt-2 flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">{provider.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                  {provider.pricing[ageGroup] === 0 ? "Free" : `CHF ${provider.pricing[ageGroup]}`}
                                </p>
                                <p className="text-xs capitalize text-gray-400">per {ageGroup}</p>
                              </div>
                              <a href={getAffiliateUrl(provider.bookingUrl)} target="_blank" rel="noopener noreferrer">
                                <Button className="gap-1.5 bg-red-600 hover:bg-red-700" size="sm">
                                  Book <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {AGE_GROUPS.map((group) => (
                              <div
                                key={group.value}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-center text-xs",
                                  ageGroup === group.value ? "border border-red-200 bg-red-50" : "bg-gray-50"
                                )}
                              >
                                <p className="text-gray-400">{group.label}</p>
                                <p className={cn("mt-0.5 font-semibold", ageGroup === group.value ? "text-red-600" : "text-gray-700")}>
                                  {provider.pricing[group.value] === 0 ? "Free" : `${provider.pricing[group.value]}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === "planning" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Card className="border-0 bg-gray-50 shadow-none">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-red-600" /> Why book from here</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600">
                      <div className="rounded-lg bg-white p-3">
                        Recommended provider: <span className="font-semibold text-gray-900">{recommendedProvider.provider.name}</span>. {recommendedProvider.reason}
                      </div>
                      <div className="rounded-lg bg-white p-3">
                        We compare provider price, rating, and booking angle before sending you off-site.
                      </div>
                      <p className="text-xs text-gray-400">Affiliate tracking may be present on booking links, but it does not change the price you pay.</p>
                    </CardContent>
                  </Card>
                  <WeatherWidget region={activity.location.region} />
                </div>
                <div className="space-y-6">
                  <SBBEstimator destinationCity={activity.location.city} activityPrice={bestPrice} />
                  <Card className="border-0 bg-gray-50 shadow-none">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-red-600" /> Add it to a trip</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600">
                      <p>Use this activity as an anchor stop in a {getRecommendedTripDays(activity)} day plan, with a suggested starting budget of CHF {getPlannerBudgetHint(activity, ageGroup)}.</p>
                      <Link href={plannerHref}>
                        <Button className="w-full gap-2 bg-red-600 hover:bg-red-700">
                          <Calendar className="h-4 w-4" /> Add to Trip Planner
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-lg leading-relaxed text-gray-600">{activity.longDescription}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {activity.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <Card className="border-0 bg-gray-50 shadow-none">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Info className="h-5 w-5 text-red-600" /> Activity Details</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{activity.duration}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Indoor/Outdoor</span><span>{activity.indoor ? "Indoor" : "Outdoor"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="capitalize">{activity.category}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Subcategory</span><span>{activity.subcategory}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Region</span><span>{activity.location.region}</span></div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-gray-50 shadow-none">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CloudSun className="h-5 w-5 text-red-600" /> Best Seasons</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {(["spring", "summer", "autumn", "winter"] as const).map((s) => {
                          const available = activity.seasons.includes(s);
                          return (
                            <div key={s} className={cn("rounded-lg border px-4 py-2 text-sm font-medium text-center", available ? "border-green-200 bg-green-50 text-green-800" : "border-gray-100 bg-gray-50 text-gray-300")}>
                              {getSeasonLabel(s)}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[28px] border-0 bg-white shadow-sm">
            <CardHeader><CardTitle className="text-lg">Book This Confidently</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-red-500">Top recommendation</p>
                <p className="mt-1 font-semibold text-gray-900">{recommendedProvider.provider.name}</p>
                <p className="mt-1 text-sm text-gray-600">{recommendedProvider.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-gray-400">Best price</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{bestPrice === 0 ? "Free" : `CHF ${bestPrice}`}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-gray-400">Avg rating</p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-bold text-gray-900"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{rating}</p>
                </div>
              </div>
              {activity.deal && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                  <Badge className="bg-red-600 text-white">{activity.deal.label}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <a href={getAffiliateUrl(cheapest.bookingUrl)} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-red-600 hover:bg-red-700 gap-2" size="lg">
                <ExternalLink className="h-4 w-4" /> Book Best Price
              </Button>
            </a>
            <Link href={plannerHref} className="block">
              <Button variant="outline" className="w-full gap-2">
                <Calendar className="h-4 w-4" /> Add to Trip Planner
              </Button>
            </Link>
            <Button
              variant="outline"
              className={cn("w-full gap-2", inComparison && "text-red-600 border-red-200")}
              onClick={() => { if (inComparison) { removeFromComparison(activity.id); } else { addToComparison(activity); } }}
            >
              {inComparison ? <><Check className="h-4 w-4" /> Added to Compare</> : <><Scale className="h-4 w-4" /> Add to Compare</>}
            </Button>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">City:</span> {activity.location.city}</p>
                <p><span className="text-gray-500">Canton:</span> {activity.location.canton}</p>
                <p><span className="text-gray-500">Region:</span> {activity.location.region}</p>
              </div>
              <Link href={`/map?lat=${activity.location.coordinates.lat}&lng=${activity.location.coordinates.lng}`}>
                <Button variant="link" className="mt-3 p-0 text-red-600 text-sm">View on Map</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Duration</span><span>{activity.duration}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Indoor/Outdoor</span><span>{activity.indoor ? "Indoor" : "Outdoor"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="capitalize">{activity.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Subcategory</span><span>{activity.subcategory}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Similar Activities</h2>
          <p className="mt-2 text-gray-500">More to explore in the same region or category</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((a) => (<ActivityCard key={a.id} activity={a} />))}
          </div>
        </section>
      )}

      <RecentlyViewed title="Continue where you left off" excludeId={activity.id} />
    </div>
  );
}

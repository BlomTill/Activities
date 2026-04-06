"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activities } from "@/data/activities";
import { getTrendingActivityIds, getTrendingInfo } from "@/data/trending";
import { getBestPrice } from "@/lib/types";
import { useAgeGroup } from "@/context/age-group-context";

export function TrendingBar() {
  const { ageGroup } = useAgeGroup();
  const trendingIds = getTrendingActivityIds().slice(0, 8);

  const trendingActivities = trendingIds
    .map((id) => activities.find((a) => a.id === id))
    .filter(Boolean);

  if (trendingActivities.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Flame className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-sm text-gray-500">What travelers are booking this week</p>
            </div>
          </div>
          <Link href="/activities?sort=trending">
            <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {trendingActivities.map((activity, index) => {
            if (!activity) return null;
            const trending = getTrendingInfo(activity.id);
            const price = getBestPrice(activity, ageGroup);

            return (
              <Link
                key={activity.id}
                href={`/activities/${activity.slug}`}
                className="group flex-shrink-0 w-64"
              >
                <div className="relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={activity.imageUrl}
                      alt={activity.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="256px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <Badge className="bg-red-600/90 text-white text-[10px] border-0 gap-1">
                        <TrendingUp className="h-3 w-3" />
                        #{index + 1}
                      </Badge>
                    </div>
                    {trending && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-orange-500/90 text-white text-[10px] border-0">
                          {trending.reason}
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <span className="rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-gray-900">
                        {price === 0 ? "Free" : `CHF ${price}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                      {activity.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {activity.location.city} · {activity.duration}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

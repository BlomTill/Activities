"use client";

import Link from "next/link";
import { MapPin, Clock, Star, Check, Scale, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityPhoto } from "@/components/activity-photo";
import { Activity, AgeGroup, getBestPrice, getAverageRating } from "@/lib/types";
import { useAgeGroup } from "@/context/age-group-context";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

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

function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `CHF ${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

interface ActivityCardProps {
  activity: Activity;
  ageGroupOverride?: AgeGroup;
}

export function ActivityCard({ activity, ageGroupOverride }: ActivityCardProps) {
  const { ageGroup: contextAgeGroup } = useAgeGroup();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const ageGroup = ageGroupOverride ?? contextAgeGroup;
  const price = getBestPrice(activity, ageGroup);
  const rating = getAverageRating(activity);
  const inComparison = isInComparison(activity.id);
  const providerCount = activity.providers.length;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/activities/${activity.slug}`} className="relative block">
        <ActivityPhoto
          activity={activity}
          aspect="16/10"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-10" />
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <Badge className={cn("text-xs", getCategoryColor(activity.category))}>
            {activity.category}
          </Badge>
          {activity.deal && (
            <Badge className="bg-red-600 text-white text-xs">
              {activity.deal.label}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3 z-20">
          <span className="rounded-lg bg-white/95 px-3 py-1.5 text-sm font-bold text-gray-900 shadow-sm">
            {price === 0 ? "Free" : `from ${formatPrice(price)}`}
          </span>
        </div>
        {providerCount > 1 && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
              <Users className="h-3 w-3" /> {providerCount} providers
            </span>
          </div>
        )}
      </Link>

      <CardContent className="p-4">
        <Link href={`/activities/${activity.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
            {activity.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{activity.description}</p>
        </Link>

        {activity.highlights && activity.highlights.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
            {activity.highlights.slice(0, 3).map((h) => (
              <span key={h.label} className="text-[11px] text-gray-500">
                <span className="font-medium text-gray-700">{h.value}</span> {h.label.toLowerCase()}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {activity.location.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {activity.duration}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {activity.seasons.map((s) => (
              <span
                key={s}
                className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 capitalize"
              >
                {s}
              </span>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-7 text-xs", inComparison && "text-red-600")}
            onClick={(e) => {
              e.preventDefault();
              if (inComparison) { removeFromComparison(activity.id); } else { addToComparison(activity); }
            }}
          >
            {inComparison ? (
              <><Check className="h-3.5 w-3.5 mr-1" />Added</>
            ) : (
              <><Scale className="h-3.5 w-3.5 mr-1" />Compare</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

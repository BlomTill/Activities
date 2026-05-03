"use client";

import Link from "next/link";
import { MapPin, Clock, Star, Check, Scale, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityPhoto } from "@/components/activity-photo";
import { Activity, AgeGroup, formatActivityPrice, getAverageRating } from "@/lib/types";
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

interface ActivityCardProps {
  activity: Activity;
  ageGroupOverride?: AgeGroup;
}

export function ActivityCard({ activity, ageGroupOverride }: ActivityCardProps) {
  const { ageGroup: contextAgeGroup } = useAgeGroup();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const ageGroup = ageGroupOverride ?? contextAgeGroup;
  const priceLabel = formatActivityPrice(activity, ageGroup, { withFrom: true });
  const rating = getAverageRating(activity);
  const inComparison = isInComparison(activity.id);
  const providerCount = activity.providers.length;

  return (
    <Card className="group card-glow overflow-hidden border border-[#2a261f] bg-[#131210]">
      <Link href={`/activities/${activity.slug}`} className="relative block overflow-hidden">
        {/* Image with built-in group-hover scale */}
        <ActivityPhoto
          activity={activity}
          aspect="16/10"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Gradient scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent z-10" />

        {/* Hover CTA overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300 bg-[#ede8df]/95 backdrop-blur-sm text-[#0c0b09] text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            View details →
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <Badge className={cn("text-xs shadow-sm", getCategoryColor(activity.category))}>
            {activity.category}
          </Badge>
          {activity.deal && (
            <Badge className="bg-red-600 text-white text-xs shadow-sm">
              {activity.deal.label}
            </Badge>
          )}
        </div>

        {/* Price badge — glows on hover */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="rounded-lg bg-[#0c0b09]/80 px-3 py-1.5 text-sm font-bold text-[#ede8df] shadow-md transition-all duration-300 group-hover:bg-[oklch(74%_0.13_63deg)] group-hover:text-[#0c0b09] group-hover:shadow-lg">
            {priceLabel}
          </span>
        </div>

        {providerCount > 1 && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="flex items-center gap-1 rounded-lg bg-[#0c0b09]/80 px-2 py-1 text-xs font-medium text-[#b0a898] shadow-sm">
              <Users className="h-3 w-3" /> {providerCount} providers
            </span>
          </div>
        )}
      </Link>

      <CardContent className="p-4">
        <Link href={`/activities/${activity.slug}`}>
          <h3 className="font-semibold text-[#ede8df] group-hover:text-[#c4973a] transition-colors duration-200 line-clamp-1">
            {activity.name}
          </h3>
          <p className="mt-1 text-sm text-[#9a9187] line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </Link>

        {activity.highlights && activity.highlights.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
            {activity.highlights.slice(0, 3).map((h) => (
              <span key={h.label} className="text-[11px] text-[#9a9187]">
                <span className="font-medium text-[#a09080]">{h.value}</span>{" "}
                {h.label.toLowerCase()}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-[#9a9187]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {activity.location.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {activity.duration}
          </span>
          {rating !== null && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {activity.seasons.map((s) => (
              <span
                key={s}
                className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-[#1e1b17] text-[#9a9187] capitalize transition-colors hover:bg-red-900/20 hover:text-red-400"
              >
                {s}
              </span>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 text-xs transition-all duration-200",
              inComparison
                ? "text-red-400 bg-red-900/20"
                : "hover:text-red-400 hover:bg-red-900/20"
            )}
            onClick={(e) => {
              e.preventDefault();
              if (inComparison) {
                removeFromComparison(activity.id);
              } else {
                addToComparison(activity);
              }
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

"use client";

import Link from "next/link";
import { Scale, X, MapPin, Clock, Star, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/context/comparison-context";
import { useAgeGroup } from "@/context/age-group-context";
import { AGE_GROUPS } from "@/lib/constants";
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

export default function ComparePage() {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const { ageGroup } = useAgeGroup();

  if (comparisonList.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">No activities to compare</h1>
        <p className="mt-2 text-gray-500">Add activities to your comparison list from any activity card.</p>
        <Link href="/activities">
          <Button className="mt-6 bg-red-600 hover:bg-red-700 gap-2">
            <ArrowRight className="h-4 w-4" /> Browse Activities
          </Button>
        </Link>
      </div>
    );
  }

  const lowestPrice = Math.min(...comparisonList.map((a) => a.pricing[ageGroup]));
  const highestRating = Math.max(...comparisonList.map((a) => a.rating));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compare Activities</h1>
          <p className="mt-2 text-gray-500">Side-by-side comparison of {comparisonList.length} activities</p>
        </div>
        <Button variant="outline" onClick={clearComparison} className="text-sm">
          Clear All
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `200px repeat(${comparisonList.length}, 1fr)` }}>
            {/* Header Row - Images */}
            <div />
            {comparisonList.map((activity) => (
              <div key={activity.id} className="relative">
                <button
                  onClick={() => removeFromComparison(activity.id)}
                  className="absolute -top-2 -right-2 z-10 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="rounded-xl overflow-hidden border bg-white">
                  <div className="relative aspect-[16/10] bg-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                      {activity.name}
                    </div>
                  </div>
                  <div className="p-3">
                    <Link href={`/activities/${activity.slug}`} className="font-semibold text-gray-900 hover:text-red-600 text-sm line-clamp-1">
                      {activity.name}
                    </Link>
                    <Badge className={cn("text-[10px] mt-1", getCategoryColor(activity.category))}>
                      {activity.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {/* Pricing by Age Group */}
            <div className="font-semibold text-gray-900 py-3 border-t mt-4 pt-4">Pricing</div>
            {comparisonList.map((a) => <div key={a.id} className="border-t mt-4" />)}

            {AGE_GROUPS.map((group) => (
              <>
                <div key={`label-${group.value}`} className={cn("text-sm py-2", ageGroup === group.value ? "text-red-600 font-medium" : "text-gray-500")}>
                  {group.label}
                </div>
                {comparisonList.map((activity) => {
                  const price = activity.pricing[group.value];
                  const isCheapest = price === Math.min(...comparisonList.map((a) => a.pricing[group.value]));
                  return (
                    <div
                      key={`${activity.id}-${group.value}`}
                      className={cn(
                        "text-sm py-2 font-medium",
                        ageGroup === group.value && "text-red-600",
                        isCheapest && comparisonList.length > 1 && "text-green-600"
                      )}
                    >
                      {price === 0 ? "Free" : `CHF ${price}`}
                      {isCheapest && comparisonList.length > 1 && price === lowestPrice && ageGroup === group.value && (
                        <Badge className="ml-2 bg-green-100 text-green-800 text-[10px]">Best Price</Badge>
                      )}
                    </div>
                  );
                })}
              </>
            ))}

            {/* Details Rows */}
            <div className="font-semibold text-gray-900 py-3 border-t mt-4 pt-4">Details</div>
            {comparisonList.map((a) => <div key={a.id} className="border-t mt-4" />)}

            <div className="text-sm text-gray-500 py-2">Location</div>
            {comparisonList.map((a) => (
              <div key={a.id} className="text-sm py-2 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" /> {a.location.city}
              </div>
            ))}

            <div className="text-sm text-gray-500 py-2">Duration</div>
            {comparisonList.map((a) => (
              <div key={a.id} className="text-sm py-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-gray-400" /> {a.duration}
              </div>
            ))}

            <div className="text-sm text-gray-500 py-2">Rating</div>
            {comparisonList.map((a) => (
              <div key={a.id} className="text-sm py-2 flex items-center gap-1">
                <Star className={cn("h-3.5 w-3.5", a.rating === highestRating ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                {a.rating}
                {a.rating === highestRating && comparisonList.length > 1 && (
                  <Badge className="ml-1 bg-amber-100 text-amber-800 text-[10px]">Top Rated</Badge>
                )}
              </div>
            ))}

            <div className="text-sm text-gray-500 py-2">Indoor/Outdoor</div>
            {comparisonList.map((a) => (
              <div key={a.id} className="text-sm py-2">{a.indoor ? "Indoor" : "Outdoor"}</div>
            ))}

            <div className="text-sm text-gray-500 py-2">Seasons</div>
            {comparisonList.map((a) => (
              <div key={a.id} className="text-sm py-2">
                <div className="flex flex-wrap gap-1">
                  {a.seasons.map((s) => (
                    <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] capitalize">{s}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="py-3 border-t mt-4" />
            {comparisonList.map((a) => (
              <div key={a.id} className="py-3 border-t mt-4 flex gap-2">
                <Link href={`/activities/${a.slug}`}>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    Details <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
                <a href={a.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs gap-1">
                    Book <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

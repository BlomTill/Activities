"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { MapPin, Route, Star, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Season } from "@/lib/types";
import { getSeasonLabel } from "@/lib/seasons";
import { DestinationSummary } from "@/lib/destinations";

const SEASONS: Array<Season | "all"> = ["all", "spring", "summer", "autumn", "winter"];

export function DestinationBrowser({
  destinations,
  seasonActivityCounts,
}: {
  destinations: DestinationSummary[];
  seasonActivityCounts: Record<string, Record<Season, number>>;
}) {
  const [selectedSeason, setSelectedSeason] = useState<Season | "all">("all");

  const filteredDestinations = useMemo(() => {
    if (selectedSeason === "all") return destinations;
    return destinations.filter((destination) => (seasonActivityCounts[destination.name]?.[selectedSeason] || 0) > 0);
  }, [destinations, seasonActivityCounts, selectedSeason]);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {SEASONS.map((season) => (
          <button
            key={season}
            onClick={() => setSelectedSeason(season)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedSeason === season
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {season === "all" ? "All seasons" : getSeasonLabel(season)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredDestinations.map((destination) => {
          const seasonalCount =
            selectedSeason === "all" ? destination.activityCount : seasonActivityCounts[destination.name]?.[selectedSeason] || 0;

          return (
            <Link key={destination.slug} href={`/destinations/${destination.slug}${selectedSeason !== "all" ? `?season=${selectedSeason}` : ""}`}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={destination.heroImage}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge className="bg-white/90 text-gray-900">{seasonalCount} picks</Badge>
                    {destination.itineraryCount > 0 && (
                      <Badge className="bg-red-600 text-white">{destination.itineraryCount} itineraries</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-2xl font-semibold">{destination.name}</h2>
                    <p className="mt-1 text-sm text-white/80">{destination.topCities.join(", ")}</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm leading-6 text-gray-600">{destination.description}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-500">
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <Star className="mx-auto h-4 w-4 text-amber-500" />
                      <div className="mt-1 font-semibold text-gray-900">{destination.averageRating}</div>
                      <div>avg rating</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <Wallet className="mx-auto h-4 w-4 text-green-600" />
                      <div className="mt-1 font-semibold text-gray-900">
                        {destination.minPrice === 0 ? "Free" : `CHF ${destination.minPrice}`}
                      </div>
                      <div>entry price</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <Route className="mx-auto h-4 w-4 text-sky-600" />
                      <div className="mt-1 font-semibold text-gray-900">{destination.featuredCount}</div>
                      <div>featured</div>
                    </div>
                  </div>
                  {selectedSeason !== "all" && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-red-600">
                      <MapPin className="h-3.5 w-3.5" />
                      Best for {getSeasonLabel(selectedSeason).toLowerCase()} trips
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

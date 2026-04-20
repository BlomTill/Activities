"use client";

import { useMemo, useState } from "react";
import { Activity } from "@/lib/types";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";
import { ActivityCard } from "@/components/activity-card";

const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

export function DestinationSeasonHighlights({
  activities,
  initialSeason,
}: {
  activities: Activity[];
  initialSeason?: string;
}) {
  const currentSeason = getCurrentSeason();
  const [selectedSeason, setSelectedSeason] = useState(
    SEASONS.includes(initialSeason as (typeof SEASONS)[number])
      ? (initialSeason as (typeof SEASONS)[number])
      : currentSeason
  );

  const filteredActivities = useMemo(
    () => activities.filter((activity) => activity.seasons.includes(selectedSeason)).slice(0, 8),
    [activities, selectedSeason]
  );

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Best by season</h2>
            <p className="mt-2 text-gray-500">Switch seasons to see when this destination feels strongest.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSeason === season ? "bg-red-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {getSeasonLabel(season)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredActivities.map((activity) => (
            <ActivityCard key={`${selectedSeason}-${activity.id}`} activity={activity} />
          ))}
        </div>
      </div>
    </section>
  );
}

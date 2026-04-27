"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activities } from "@/lib/content/selectors";
import { useAgeGroup } from "@/context/age-group-context";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";
import { CATEGORIES } from "@/lib/constants";
import { Category } from "@/lib/types";

const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

export default function MapPage() {
  const { ageGroup } = useAgeGroup();
  const season = getCurrentSeason();
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [seasonFilter, setSeasonFilter] = useState(true);

  const filtered = activities.filter((a) => {
    if (selectedCategory && a.category !== selectedCategory) return false;
    if (seasonFilter && !a.seasons.includes(season)) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="border-b bg-white px-4 py-3 flex items-center gap-3 overflow-x-auto">
        <MapIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-700 flex-shrink-0">
          {filtered.length} activities on map
        </span>
        <div className="flex gap-2 flex-shrink-0">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
              className="text-xs h-7"
            >
              {cat.label}
            </Button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 ml-auto">
          <input
            type="checkbox"
            checked={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.checked)}
            className="rounded"
          />
          In season ({getSeasonLabel(season)})
        </label>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapView activities={filtered} ageGroup={ageGroup} />
      </div>
    </div>
  );
}

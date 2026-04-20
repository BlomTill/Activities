"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, MapPin, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { activities } from "@/data/activities";
import { useAgeGroup } from "@/context/age-group-context";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";
import { CATEGORIES, REGIONS } from "@/lib/constants";
import { Category, Season, getBestPrice, getAverageRating } from "@/lib/types";

const SEASONS: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
];

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-400">Loading activities...</div>}>
      <ActivitiesContent />
    </Suspense>
  );
}

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const { ageGroup } = useAgeGroup();
  const currentSeason = getCurrentSeason();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">(
    (searchParams.get("category") as Category) || ""
  );
  const [selectedSeason, setSelectedSeason] = useState<Season | "">(
    (searchParams.get("season") as Season) || ""
  );
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get("region") || "");
  const [indoorOnly, setIndoorOnly] = useState(false);
  const [showCurrentSeason, setShowCurrentSeason] = useState(
    !searchParams.get("season") && !searchParams.get("category") && !searchParams.get("q")
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : -1
  );
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "name">("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...activities];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.subcategory.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q)) ||
          a.location.city.toLowerCase().includes(q) ||
          a.location.region.toLowerCase().includes(q) ||
          a.location.canton.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (selectedSeason) {
      result = result.filter((a) => a.seasons.includes(selectedSeason));
    } else if (showCurrentSeason) {
      result = result.filter((a) => a.seasons.includes(currentSeason));
    }

    if (selectedRegion) {
      result = result.filter((a) => a.location.region === selectedRegion);
    }

    if (indoorOnly) {
      result = result.filter((a) => a.indoor);
    }

    if (maxPrice >= 0) {
      result = result.filter((a) => getBestPrice(a, ageGroup) <= maxPrice);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => getBestPrice(a, ageGroup) - getBestPrice(b, ageGroup));
        break;
      case "price-desc":
        result.sort((a, b) => getBestPrice(b, ageGroup) - getBestPrice(a, ageGroup));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => getAverageRating(b) - getAverageRating(a));
    }

    return result;
  }, [query, selectedCategory, selectedSeason, selectedRegion, indoorOnly, maxPrice, sortBy, showCurrentSeason, currentSeason, ageGroup]);

  const activeFilterCount = [selectedCategory, selectedSeason, selectedRegion, indoorOnly, maxPrice >= 0].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSeason("");
    setSelectedRegion("");
    setIndoorOnly(false);
    setMaxPrice(-1);
    setShowCurrentSeason(false);
    setQuery("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="surface-panel mb-8 overflow-hidden p-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <Sparkles className="h-4 w-4" />
              Explore smarter
            </div>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">All Activities</h1>
            <p className="mt-3 max-w-2xl text-gray-500">
              Browse with fewer decisions at once: search first, then open filters only if you need to narrow the list.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Results</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{filtered.length}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Filters</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{activeFilterCount}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">Season</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {showCurrentSeason && !selectedSeason ? getSeasonLabel(currentSeason) : selectedSeason ? getSeasonLabel(selectedSeason) : "All"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities, regions, categories, or cities..."
            className="h-12 rounded-2xl border-white bg-white/90 pl-10 text-gray-900 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 bg-red-600 text-white h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
          >
            <option value="rating">Top Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 rounded-[28px] border bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500">
              Clear all
            </Button>
          </div>

          {/* Season Toggle */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Season</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={showCurrentSeason && !selectedSeason ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowCurrentSeason(true);
                  setSelectedSeason("");
                }}
                className="text-xs"
              >
                In Season Now ({getSeasonLabel(currentSeason)})
              </Button>
              {SEASONS.map((s) => (
                <Button
                  key={s.value}
                  variant={selectedSeason === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedSeason(selectedSeason === s.value ? "" : s.value);
                    setShowCurrentSeason(false);
                  }}
                  className="text-xs"
                >
                  {s.label}
                </Button>
              ))}
              <Button
                variant={!showCurrentSeason && !selectedSeason ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowCurrentSeason(false);
                  setSelectedSeason("");
                }}
                className="text-xs"
              >
                All Seasons
              </Button>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
                  className="text-xs"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Region</p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion(selectedRegion === region ? "" : region)}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {region}
                </Button>
              ))}
            </div>
          </div>

          {/* Indoor / Price */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={indoorOnly}
                onChange={(e) => setIndoorOnly(e.target.checked)}
                className="rounded"
              />
              Indoor only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={maxPrice === 0}
                onChange={(e) => setMaxPrice(e.target.checked ? 0 : -1)}
                className="rounded"
              />
              Free activities only
            </label>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedCategory("")}>
              {selectedCategory} <X className="h-3 w-3" />
            </Badge>
          )}
          {selectedSeason && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedSeason("")}>
              {getSeasonLabel(selectedSeason)} <X className="h-3 w-3" />
            </Badge>
          )}
          {selectedRegion && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedRegion("")}>
              {selectedRegion} <X className="h-3 w-3" />
            </Badge>
          )}
          {indoorOnly && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setIndoorOnly(false)}>
              Indoor <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Grid */}
      {filtered.length > 0 ? (
        <>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {filtered.length} activities found
              {showCurrentSeason && !selectedSeason && ` for ${getSeasonLabel(currentSeason).toLowerCase()}`}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500">No activities found matching your filters.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2 text-red-600">
            Clear all filters
          </Button>
        </div>
      )}

      <RecentlyViewed title="Jump back into recent finds" />
    </div>
  );
}

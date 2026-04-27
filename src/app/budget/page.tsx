"use client";

import Link from "next/link";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, Sparkles, ArrowRight, Train } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityCard } from "@/components/activity-card";
import { activities } from "@/lib/content/selectors";
import { useAgeGroup } from "@/context/age-group-context";
import { AGE_GROUPS } from "@/lib/constants";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";
import { getBestPrice, getAverageRating } from "@/lib/types";

const PRESET_BUDGETS = [0, 20, 50, 100, 200];

export default function BudgetPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-400">Loading budget explorer...</div>}>
      <BudgetContent />
    </Suspense>
  );
}

function BudgetContent() {
  const searchParams = useSearchParams();
  const { ageGroup, setAgeGroup } = useAgeGroup();
  const initialBudget = Number(searchParams.get("budget") || "50");
  const [budget, setBudget] = useState<number>(Number.isFinite(initialBudget) ? initialBudget : 50);
  const [customBudget, setCustomBudget] = useState(searchParams.get("budget") || "");
  const [seasonFilter, setSeasonFilter] = useState(searchParams.get("season") === "current");
  const currentSeason = getCurrentSeason();

  useEffect(() => {
    const requestedAgeGroup = searchParams.get("ageGroup");
    if (requestedAgeGroup && AGE_GROUPS.some((group) => group.value === requestedAgeGroup)) {
      setAgeGroup(requestedAgeGroup as typeof ageGroup);
    }
  }, [searchParams, setAgeGroup]);

  const affordableActivities = useMemo(() => {
    let result = activities.filter((a) => getBestPrice(a, ageGroup) <= budget);
    if (seasonFilter) {
      result = result.filter((a) => a.seasons.includes(currentSeason));
    }
    result.sort((a, b) => getAverageRating(b) - getAverageRating(a));
    return result;
  }, [budget, ageGroup, seasonFilter, currentSeason]);

  const totalSaved = useMemo(() => {
    const maxPrices = affordableActivities.map((a) =>
      Math.max(...a.providers.map((p) => Math.max(p.pricing.adult, p.pricing.senior)))
    );
    const yourPrices = affordableActivities.map((a) => getBestPrice(a, ageGroup));
    return maxPrices.reduce((sum, p, i) => sum + (p - yourPrices[i]), 0);
  }, [affordableActivities, ageGroup]);
  const plannerHref = `/planner?days=${budget <= 50 ? 2 : budget <= 120 ? 3 : 5}&budget=${budget}&ageGroup=${ageGroup}${seasonFilter ? "&season=current" : ""}`;
  const passHref = `/travel-passes?tripDays=${budget <= 50 ? 2 : budget <= 120 ? 4 : 7}&travelDays=${budget <= 50 ? 1 : budget <= 120 ? 3 : 5}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 mb-4">
          <Wallet className="h-4 w-4" />
          Budget Explorer
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          What can you do for your budget?
        </h1>
        <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
          Enter your budget and we&apos;ll show you all activities you can afford.
          Prices automatically adjust to your selected age group.
        </p>
      </div>

      <div className="mx-auto max-w-2xl mb-12">
        <Card className="p-6">
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">I am a...</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map((group) => (
                <Button
                  key={group.value}
                  variant={ageGroup === group.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAgeGroup(group.value)}
                  className={ageGroup === group.value ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {group.label}
                  <span className="ml-1 text-xs opacity-70">({group.description})</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">My budget is...</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_BUDGETS.map((preset) => (
                <Button
                  key={preset}
                  variant={budget === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setBudget(preset); setCustomBudget(""); }}
                  className={budget === preset ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {preset === 0 ? "Free only" : `CHF ${preset}`}
                </Button>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customBudget}
                  onChange={(e) => {
                    setCustomBudget(e.target.value);
                    if (e.target.value) setBudget(Number(e.target.value));
                  }}
                  className="w-28 h-9"
                />
                <span className="text-sm text-gray-400">CHF</span>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.checked)}
              className="rounded"
            />
            Only show in-season activities ({getSeasonLabel(currentSeason)})
          </label>
        </Card>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{affordableActivities.length}</p>
            <p className="text-xs text-gray-500 mt-1">Activities Available</p>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {affordableActivities.filter((a) => getBestPrice(a, ageGroup) === 0).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completely Free</p>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">CHF {Math.round(totalSaved)}</p>
            <p className="text-xs text-gray-500 mt-1">Saved as {ageGroup}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link href={plannerHref} className="rounded-xl border bg-gray-50 p-4 transition-colors hover:border-red-200 hover:bg-red-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Turn this into a trip plan</p>
                <p className="mt-1 text-sm text-gray-500">Start a planner with this budget and your current traveler type.</p>
              </div>
              <ArrowRight className="h-5 w-5 text-red-600" />
            </div>
          </Link>
          <Link href={passHref} className="rounded-xl border bg-gray-50 p-4 transition-colors hover:border-red-200 hover:bg-red-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Check transport value</p>
                <p className="mt-1 text-sm text-gray-500">Compare whether a pass helps once you start moving between cities.</p>
              </div>
              <Train className="h-5 w-5 text-red-600" />
            </div>
          </Link>
        </div>
      </div>

      {affordableActivities.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {affordableActivities.length} activities for CHF {budget} or less
            {seasonFilter && ` this ${getSeasonLabel(currentSeason).toLowerCase()}`}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {affordableActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">No activities found for this budget.</p>
          <p className="text-sm text-gray-400 mt-1">Try increasing your budget or changing the season filter.</p>
        </div>
      )}
    </div>
  );
}

function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

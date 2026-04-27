"use client";

import Link from "next/link";
import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Plus,
  Minus,
  Search,
  ChevronUp,
  ChevronDown,
  Trash2,
  Share2,
  Clock,
  MapPin,
  Check,
  ClipboardList,
  Wallet,
  Train,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { activities } from "@/lib/content/selectors";
import { Activity, AgeGroup, getBestPrice } from "@/lib/types";
import { useAgeGroup } from "@/context/age-group-context";
import { cn } from "@/lib/utils";
import { decodePlannerPlan, getPlannerDefaults } from "@/lib/trip-tools";

const AGE_GROUPS: AgeGroup[] = ["child", "student", "adult", "senior"];
const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child: "Child",
  student: "Student",
  adult: "Adult",
  senior: "Senior",
};
const PLANNER_STORAGE_KEY = "explore-switzerland-planner-draft";

interface DayPlan {
  activities: Activity[];
}

function encodePlan(numDays: number, days: DayPlan[]): string {
  const data = days.slice(0, numDays).map((d) => d.activities.map((a) => a.id));
  return btoa(JSON.stringify(data));
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-400">Loading planner...</div>}>
      <PlannerContent />
    </Suspense>
  );
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const defaults = getPlannerDefaults(searchParams);
  const { ageGroup } = useAgeGroup();
  const [numDays, setNumDays] = useState(defaults.tripDays);
  const [activeDay, setActiveDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [days, setDays] = useState<DayPlan[]>(() =>
    Array.from({ length: 14 }, () => ({ activities: [] }))
  );
  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [tripName, setTripName] = useState("My Switzerland Trip");
  const [saveMessage, setSaveMessage] = useState("Not saved yet");

  useEffect(() => {
    if (prefillApplied) return;

    if (typeof window !== "undefined" && !defaults.plan && !defaults.activitySlug) {
      const savedDraft = window.localStorage.getItem(PLANNER_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft) as {
            tripName?: string;
            numDays?: number;
            days?: string[][];
          };
          if (parsed.tripName) setTripName(parsed.tripName);
          const savedDays = parsed.days;
          if (Array.isArray(savedDays) && savedDays.length > 0) {
            setNumDays(Math.max(1, Math.min(14, parsed.numDays || savedDays.length)));
            setDays((prev) => {
              const next = [...prev];
              savedDays.slice(0, 14).forEach((activityIds, index) => {
                next[index] = {
                  activities: activityIds
                    .map((id) => activities.find((activity) => activity.id === id))
                    .filter((activity): activity is Activity => Boolean(activity)),
                };
              });
              return next;
            });
            setSaveMessage("Restored saved draft");
            setPrefillApplied(true);
            return;
          }
        } catch {
          window.localStorage.removeItem(PLANNER_STORAGE_KEY);
        }
      }
    }

    if (defaults.plan) {
      const decodedPlan = decodePlannerPlan(defaults.plan);
      if (decodedPlan.length > 0) {
        setNumDays(Math.max(1, Math.min(14, decodedPlan.length)));
        setDays((prev) => {
          const next = [...prev];
          decodedPlan.slice(0, 14).forEach((activityIds, index) => {
            next[index] = {
              activities: activityIds
                .map((id) => activities.find((activity) => activity.id === id))
                .filter((activity): activity is Activity => Boolean(activity)),
            };
          });
          return next;
        });
        setSaveMessage("Loaded itinerary into planner");
        setPrefillApplied(true);
        return;
      }
    }

    const requestedActivity = defaults.activitySlug
      ? activities.find((activity) => activity.slug === defaults.activitySlug)
      : undefined;

    if (!requestedActivity) {
      setPrefillApplied(true);
      return;
    }

    setDays((prev) => {
      const next = [...prev];
      const alreadyAdded = next[0].activities.some((activity) => activity.id === requestedActivity.id);
      next[0] = {
        activities: alreadyAdded ? next[0].activities : [...next[0].activities, requestedActivity],
      };
      return next;
    });
    setPrefillApplied(true);
  }, [defaults.activitySlug, defaults.plan, prefillApplied]);

  useEffect(() => {
    if (!prefillApplied || typeof window === "undefined") return;
    const payload = {
      tripName,
      numDays,
      days: days.slice(0, numDays).map((day) => day.activities.map((activity) => activity.id)),
    };
    window.localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(payload));
    setSaveMessage("Saved locally on this device");
  }, [days, numDays, prefillApplied, tripName]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return activities
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.location.city.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery]);

  const addActivity = useCallback(
    (activity: Activity) => {
      setDays((prev) => {
        const next = [...prev];
        next[activeDay] = {
          activities: [...next[activeDay].activities, activity],
        };
        return next;
      });
      setSearchQuery("");
      setShowSearch(false);
    },
    [activeDay]
  );

  const removeActivity = useCallback(
    (dayIndex: number, activityIndex: number) => {
      setDays((prev) => {
        const next = [...prev];
        const acts = [...next[dayIndex].activities];
        acts.splice(activityIndex, 1);
        next[dayIndex] = { activities: acts };
        return next;
      });
    },
    []
  );

  const moveActivity = useCallback(
    (dayIndex: number, fromIndex: number, direction: -1 | 1) => {
      setDays((prev) => {
        const next = [...prev];
        const acts = [...next[dayIndex].activities];
        const toIndex = fromIndex + direction;
        if (toIndex < 0 || toIndex >= acts.length) return prev;
        [acts[fromIndex], acts[toIndex]] = [acts[toIndex], acts[fromIndex]];
        next[dayIndex] = { activities: acts };
        return next;
      });
    },
    []
  );

  const totalPerAgeGroup = useMemo(() => {
    const totals: Record<AgeGroup, number> = {
      child: 0,
      student: 0,
      adult: 0,
      senior: 0,
    };
    for (let i = 0; i < numDays; i++) {
      for (const activity of days[i].activities) {
        for (const ag of AGE_GROUPS) {
          totals[ag] += getBestPrice(activity, ag);
        }
      }
    }
    return totals;
  }, [days, numDays]);

  const dayTotals = useMemo(() => {
    return days.slice(0, numDays).map((day) => {
      const total: Record<AgeGroup, number> = {
        child: 0,
        student: 0,
        adult: 0,
        senior: 0,
      };
      for (const activity of day.activities) {
        for (const ag of AGE_GROUPS) {
          total[ag] += getBestPrice(activity, ag);
        }
      }
      return total;
    });
  }, [days, numDays]);

  const totalActivities = useMemo(() => {
    let count = 0;
    for (let i = 0; i < numDays; i++) {
      count += days[i].activities.length;
    }
    return count;
  }, [days, numDays]);

  const handleShare = useCallback(() => {
    const encoded = encodePlan(numDays, days);
    const url = `${window.location.origin}/planner?plan=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [numDays, days]);

  const handleClearDraft = useCallback(() => {
    const emptyDays = Array.from({ length: 14 }, () => ({ activities: [] }));
    setDays(emptyDays);
    setNumDays(3);
    setActiveDay(0);
    setTripName("My Switzerland Trip");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PLANNER_STORAGE_KEY);
    }
    setSaveMessage("Draft cleared");
  }, []);

  const handleExportText = useCallback(() => {
    let text = `${tripName}\n`;
    text += "=".repeat(tripName.length) + "\n\n";
    text += `Switzerland Trip Planner — ${numDays} Day${numDays > 1 ? "s" : ""}\n`;
    text += "=".repeat(50) + "\n\n";

    for (let i = 0; i < numDays; i++) {
      text += `Day ${i + 1}\n`;
      text += "-".repeat(30) + "\n";
      if (days[i].activities.length === 0) {
        text += "  No activities planned\n";
      } else {
        for (const a of days[i].activities) {
          text += `  • ${a.name} (${a.location.city}) — CHF ${getBestPrice(a, ageGroup)} (${ageGroup}) — ${a.duration}\n`;
        }
      }
      text += "\n";
    }

    text += "Budget Summary\n";
    text += "-".repeat(30) + "\n";
    for (const ag of AGE_GROUPS) {
      text += `  ${AGE_GROUP_LABELS[ag]}: CHF ${totalPerAgeGroup[ag]}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tripName, numDays, days, ageGroup, totalPerAgeGroup]);

  const currentDayActivities = days[activeDay]?.activities ?? [];
  const selectedBudget = defaults.budget;
  const budgetHref = `/budget?budget=${Math.max(selectedBudget, totalPerAgeGroup[ageGroup] || 50)}&ageGroup=${ageGroup}${defaults.seasonMode === "current" ? "&season=current" : ""}`;
  const recommendedTravelPassHref = `/travel-passes?tripDays=${numDays}&travelDays=${Math.max(1, Math.min(numDays, numDays - 1 || 1))}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 mb-4">
          <CalendarDays className="h-4 w-4" />
          Trip Planner
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Plan Your Switzerland Adventure
        </h1>
        <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
          Build your perfect Switzerland itinerary and see the total cost
        </p>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-red-600">
              <ClipboardList className="h-4 w-4" />
              Trip setup
            </div>
            <h2 className="mt-2 text-xl font-bold text-gray-900">
              Build the trip first, then pressure-test the budget
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              This planner works best when you collect the activities you really want, then check your budget and transport pass against the plan.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">{numDays} planned day{numDays > 1 ? "s" : ""}</span>
              {selectedBudget > 0 && (
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">Target budget: CHF {selectedBudget}</span>
              )}
              <span className="rounded-full bg-white px-3 py-1 shadow-sm capitalize">{ageGroup} pricing</span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">{saveMessage}</span>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Trip name</label>
              <Input
                value={tripName}
                onChange={(e) => setTripName(e.target.value || "My Switzerland Trip")}
                placeholder="My Switzerland Trip"
                className="max-w-md bg-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold text-gray-900">Next best steps</h3>
            <div className="mt-4 space-y-3">
              <Link href={budgetHref} className="block rounded-xl border bg-gray-50 p-4 transition-colors hover:border-red-200 hover:bg-red-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">Check budget fit</p>
                    <p className="mt-1 text-sm text-gray-500">Review what fits your plan and current price assumptions.</p>
                  </div>
                  <Wallet className="h-5 w-5 text-red-600" />
                </div>
              </Link>
              <Link href={recommendedTravelPassHref} className="block rounded-xl border bg-gray-50 p-4 transition-colors hover:border-red-200 hover:bg-red-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">Compare transport passes</p>
                    <p className="mt-1 text-sm text-gray-500">See which pass matches the number of days you expect to move around.</p>
                  </div>
                  <Train className="h-5 w-5 text-red-600" />
                </div>
              </Link>
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium text-gray-900">Saved trip controls</p>
              <p className="mt-1 text-sm text-gray-500">Your trip is stored locally in this browser so you can come back later.</p>
              <Button variant="outline" className="mt-3 w-full" onClick={handleClearDraft}>
                Clear saved draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day count selector */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-gray-700">Trip length:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setNumDays((d) => Math.max(1, d - 1))}
            disabled={numDays <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-lg font-semibold text-gray-900">
            {numDays} day{numDays > 1 ? "s" : ""}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setNumDays((d) => Math.min(14, d + 1))}
            disabled={numDays >= 14}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main panel */}
        <div>
          {/* Day tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: numDays }, (_, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  activeDay === i
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Day {i + 1}
                {days[i].activities.length > 0 && (
                  <Badge
                    className={cn(
                      "ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-xs",
                      activeDay === i
                        ? "bg-white/20 text-white"
                        : "bg-gray-300 text-gray-700"
                    )}
                  >
                    {days[i].activities.length}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Add activity */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search activities to add..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  className="pl-10"
                />
              </div>

              {showSearch && searchQuery.trim() && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border bg-white">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No activities found for &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    searchResults.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => addActivity(activity)}
                        className="flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-red-50 last:border-b-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          <Plus className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {activity.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {activity.location.city}
                            <span className="text-gray-300">·</span>
                            <Clock className="h-3 w-3" />
                            {activity.duration}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-red-600">
                          CHF {getBestPrice(activity, ageGroup)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Day activities list */}
          {currentDayActivities.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-500">
                No activities yet
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Search above to add activities to Day {activeDay + 1}
              </p>
              <Link href="/activities">
                <Button variant="ghost" className="mt-4 gap-1 text-red-600">
                  Browse activities <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {currentDayActivities.map((activity, idx) => (
                <Card key={`${activity.id}-${idx}`} className="overflow-hidden">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Order number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                      {idx + 1}
                    </div>

                    {/* Activity info */}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">
                        {activity.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.location.city}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.duration}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        CHF {getBestPrice(activity, ageGroup)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {AGE_GROUP_LABELS[ageGroup]}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveActivity(activeDay, idx, -1)}
                        disabled={idx === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveActivity(activeDay, idx, 1)}
                        disabled={idx === currentDayActivities.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-600"
                      onClick={() => removeActivity(activeDay, idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Day subtotal */}
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Day {activeDay + 1} subtotal ({AGE_GROUP_LABELS[ageGroup]})
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    CHF {dayTotals[activeDay]?.[ageGroup] ?? 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — Budget summary */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Budget Summary
              </h2>

              {/* Stats */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {numDays}
                  </div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {totalActivities}
                  </div>
                  <div className="text-xs text-gray-500">Activities</div>
                </div>
              </div>

              {/* Per age group totals */}
              <div className="space-y-2">
                {AGE_GROUPS.map((ag) => (
                  <div
                    key={ag}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                      ag === ageGroup
                        ? "bg-red-600 font-semibold text-white"
                        : "bg-gray-50 text-gray-700"
                    )}
                  >
                    <span>{AGE_GROUP_LABELS[ag]}</span>
                    <span>CHF {totalPerAgeGroup[ag]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Per-day breakdown */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Daily Breakdown ({AGE_GROUP_LABELS[ageGroup]})
              </h3>
              <div className="space-y-2">
                {Array.from({ length: numDays }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">Day {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {days[i].activities.length} activit
                        {days[i].activities.length === 1 ? "y" : "ies"}
                      </span>
                      <span className="font-medium text-gray-900">
                        CHF {dayTotals[i]?.[ageGroup] ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-red-600">
                    CHF {totalPerAgeGroup[ageGroup]}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleShare}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={totalActivities === 0}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" /> Share Itinerary
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportText}
              className="w-full"
              disabled={totalActivities === 0}
            >
              <ClipboardList className="mr-2 h-4 w-4" /> Copy as Text
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

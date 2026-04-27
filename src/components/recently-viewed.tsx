"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { ActivityCard } from "@/components/activity-card";
import { Button } from "@/components/ui/button";
import { activities } from "@/lib/content/selectors";
import { Activity } from "@/lib/types";

export const RECENTLY_VIEWED_STORAGE_KEY = "explore-switzerland-recently-viewed";

export function saveRecentlyViewedActivity(activityId: string) {
  if (typeof window === "undefined") return;
  const existing = getRecentlyViewedIds();
  const next = [activityId, ...existing.filter((id) => id !== activityId)].slice(0, 8);
  window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
}

function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function RecentlyViewed({
  title = "Recently Viewed",
  excludeId,
}: {
  title?: string;
  excludeId?: string;
}) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentlyViewedIds());
  }, []);

  const recentActivities = useMemo<Activity[]>(
    () =>
      recentIds
        .filter((id) => id !== excludeId)
        .map((id) => activities.find((activity) => activity.id === id))
        .filter((activity): activity is Activity => Boolean(activity))
        .slice(0, 4),
    [excludeId, recentIds]
  );

  if (recentActivities.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-red-600">
            <Clock3 className="h-4 w-4" />
            Keep exploring
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-500">Pick up where you left off without searching again.</p>
        </div>
        <Link href="/activities">
          <Button variant="ghost" className="text-red-600">All activities</Button>
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recentActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Shuffle, MapPin, Clock, Star, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { activities } from "@/data/activities";
import { useAgeGroup } from "@/context/age-group-context";
import { getCurrentSeason, getSeasonLabel, getSeasonColors } from "@/lib/seasons";
import { Activity } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SurprisePage() {
  const { ageGroup } = useAgeGroup();
  const season = getCurrentSeason();
  const colors = getSeasonColors(season);
  const [result, setResult] = useState<Activity | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<Activity[]>([]);

  const seasonalActivities = activities.filter((a) => a.seasons.includes(season));

  const pickRandom = useCallback(() => {
    setIsSpinning(true);
    const pool = seasonalActivities.filter((a) => a.id !== result?.id);
    const randomIndex = Math.floor(Math.random() * pool.length);

    setTimeout(() => {
      const picked = pool[randomIndex];
      setResult(picked);
      setHistory((prev) => [picked, ...prev.filter((h) => h.id !== picked.id)].slice(0, 5));
      setIsSpinning(false);
    }, 800);
  }, [seasonalActivities, result]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 mb-4">
          <Shuffle className="h-4 w-4" />
          Surprise Me
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Can&apos;t decide? Let us pick for you!
        </h1>
        <p className="mt-3 text-gray-500 max-w-xl mx-auto">
          We&apos;ll randomly select a {getSeasonLabel(season).toLowerCase()} activity from our collection.
          Hit the button and see where adventure takes you.
        </p>
      </div>

      {/* Big Button */}
      <div className="flex justify-center mb-12">
        <button
          onClick={pickRandom}
          disabled={isSpinning}
          className={cn(
            "group relative h-40 w-40 rounded-full bg-gradient-to-br shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-70",
            colors.gradient
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Shuffle className={cn("h-12 w-12 mb-2", isSpinning && "animate-spin")} />
            <span className="text-lg font-bold">
              {isSpinning ? "Picking..." : result ? "Again!" : "Surprise Me"}
            </span>
          </div>
        </button>
      </div>

      {/* Result */}
      {result && !isSpinning && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border-2 border-red-100 bg-white shadow-lg overflow-hidden">
            <div className="relative aspect-[21/9] bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
                {result.name}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <Badge className="bg-white/20 text-white backdrop-blur-sm mb-2 capitalize">
                  {result.category}
                </Badge>
                <h2 className="text-2xl font-bold md:text-3xl">{result.name}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{result.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {result.location.city}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {result.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {result.rating}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400 capitalize">{ageGroup} price</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.pricing[ageGroup] === 0 ? "Free" : `CHF ${result.pricing[ageGroup]}`}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/activities/${result.slug}`}>
                    <Button variant="outline" className="gap-2">
                      Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href={result.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-red-600 hover:bg-red-700 gap-2">
                      Book <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Picks</h3>
          <div className="space-y-2">
            {history.slice(1).map((h) => (
              <Link
                key={h.id}
                href={`/activities/${h.slug}`}
                className="flex items-center justify-between rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{h.name}</p>
                  <p className="text-sm text-gray-500">{h.location.city} &middot; {h.duration}</p>
                </div>
                <span className="font-semibold text-gray-900">
                  {h.pricing[ageGroup] === 0 ? "Free" : `CHF ${h.pricing[ageGroup]}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 rounded-xl bg-gray-50 p-6 text-center">
        <Sparkles className="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Drawing from <strong>{seasonalActivities.length} activities</strong> available this {getSeasonLabel(season).toLowerCase()}
        </p>
      </div>
    </div>
  );
}

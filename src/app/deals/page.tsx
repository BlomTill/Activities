"use client";

import Link from "next/link";
import { Tag, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/activity-card";
import { activities, getActivitiesWithDeals } from "@/lib/content/selectors";
import { useAgeGroup } from "@/context/age-group-context";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";
import { getBestPrice } from "@/lib/types";

export default function DealsPage() {
  const { ageGroup } = useAgeGroup();
  const dealsActivities = getActivitiesWithDeals().sort((a, b) =>
    new Date(a.deal?.validUntil || "2099-12-31").getTime() - new Date(b.deal?.validUntil || "2099-12-31").getTime()
  );
  const season = getCurrentSeason();

  const freeActivities = activities.filter((a) => getBestPrice(a, ageGroup) === 0 && a.seasons.includes(season));
  const cheapActivities = activities
    .filter((a) => getBestPrice(a, ageGroup) > 0 && getBestPrice(a, ageGroup) <= 15 && a.seasons.includes(season))
    .sort((a, b) => getBestPrice(a, ageGroup) - getBestPrice(b, ageGroup));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 mb-4">
          <Tag className="h-4 w-4" />
          Deals & Offers
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Current Deals & Discounts
        </h1>
        <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
          Special offers, free activities, and budget-friendly options across Switzerland.
        </p>
      </div>

      {/* Partner Deals Banner */}
      <div className="mb-12 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-8 text-white text-center">
        <Percent className="h-10 w-10 mx-auto mb-3 opacity-80" />
        <h2 className="text-2xl font-bold">Useful deals, not deal spam</h2>
        <p className="mt-2 text-red-100 max-w-lg mx-auto">
          We surface deals that help a real trip decision: free alternatives, seasonal discounts,
          and providers worth checking before you book at full price.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Badge className="bg-white/20 text-white text-sm backdrop-blur-sm">Student Discounts</Badge>
          <Badge className="bg-white/20 text-white text-sm backdrop-blur-sm">Group Rates</Badge>
          <Badge className="bg-white/20 text-white text-sm backdrop-blur-sm">Seasonal Offers</Badge>
        </div>
      </div>

      {/* Special Deals */}
      {dealsActivities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Special Deals</h2>
          <p className="text-gray-500 mb-6">The most decision-worthy offers first, sorted by the soonest expiry</p>
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            {dealsActivities.slice(0, 3).map((activity) => (
              <div key={`${activity.id}-highlight`} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-600 text-white">{activity.deal?.label}</Badge>
                  <span className="text-xs text-gray-400">until {activity.deal?.validUntil}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{activity.name}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{activity.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Best {ageGroup} price</span>
                  <span className="font-semibold text-gray-900">
                    {getBestPrice(activity, ageGroup) === 0 ? "Free" : `CHF ${getBestPrice(activity, ageGroup)}`}
                  </span>
                </div>
                <Link href={`/activities/${activity.slug}`}>
                  <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">See deal details</Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dealsActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {/* Free Activities */}
      {freeActivities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Free This {getSeasonLabel(season)}
          </h2>
          <p className="text-gray-500 mb-6">
            Amazing experiences that cost absolutely nothing as a {ageGroup}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {freeActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {/* Under CHF 15 */}
      {cheapActivities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Under CHF 15</h2>
          <p className="text-gray-500 mb-6">Great value activities for budget-conscious explorers</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cheapActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {/* Tips Section */}
      <section className="rounded-2xl bg-gray-50 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Money-Saving Tips</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "SBB Half-Fare Card",
              desc: "50% off trains and many mountain railways. Pays for itself quickly if you explore often.",
            },
            {
              title: "Student ID",
              desc: "Many activities offer significant student discounts. Always carry your student ID.",
            },
            {
              title: "Swiss Museum Pass",
              desc: "CHF 166/year for free entry to 500+ museums. Essential for culture lovers.",
            },
            {
              title: "Off-Peak Visits",
              desc: "Visit popular destinations on weekdays or shoulder season for lower prices and fewer crowds.",
            },
            {
              title: "City Cards",
              desc: "Zurich Card, Bern Ticket, etc. offer free transport and museum entries when staying in the city.",
            },
            {
              title: "Group Bookings",
              desc: "Many adventure activities offer group discounts for 4+ people. Organize with friends!",
            },
          ].map((tip) => (
            <div key={tip.title} className="rounded-lg bg-white p-4 border">
              <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
              <p className="text-sm text-gray-500">{tip.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link href={`/planner?days=3&budget=80&ageGroup=${ageGroup}&season=current`} className="rounded-xl border bg-white p-4 transition-colors hover:border-red-200 hover:bg-red-50">
            <p className="font-medium text-gray-900">Build a budget-first trip</p>
            <p className="mt-1 text-sm text-gray-500">Start with a realistic low-cost plan before choosing premium extras.</p>
          </Link>
          <Link href="/travel-passes?tripDays=5&travelDays=3" className="rounded-xl border bg-white p-4 transition-colors hover:border-red-200 hover:bg-red-50">
            <p className="font-medium text-gray-900">Check if transport savings matter more</p>
            <p className="mt-1 text-sm text-gray-500">Sometimes the bigger win is the right pass, not a small activity discount.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

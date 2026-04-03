"use client";

import { Tag, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity-card";
import { activities, getActivitiesWithDeals } from "@/data/activities";
import { useAgeGroup } from "@/context/age-group-context";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";

export default function DealsPage() {
  const { ageGroup } = useAgeGroup();
  const dealsActivities = getActivitiesWithDeals();
  const season = getCurrentSeason();

  const freeActivities = activities.filter((a) => a.pricing[ageGroup] === 0 && a.seasons.includes(season));
  const cheapActivities = activities
    .filter((a) => a.pricing[ageGroup] > 0 && a.pricing[ageGroup] <= 15 && a.seasons.includes(season))
    .sort((a, b) => a.pricing[ageGroup] - b.pricing[ageGroup]);

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
        <h2 className="text-2xl font-bold">Want exclusive deals?</h2>
        <p className="mt-2 text-red-100 max-w-lg mx-auto">
          We&apos;re partnering with activity providers across Switzerland to bring you exclusive discounts.
          Check back regularly for new offers!
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
          <p className="text-gray-500 mb-6">Activities with current promotions and discounts</p>
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
      </section>
    </div>
  );
}

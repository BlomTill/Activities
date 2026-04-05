"use client";

import Link from "next/link";
import { Mountain, Landmark, Zap, Users, Heart, ArrowRight, Shuffle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search-bar";
import { ActivityCard } from "@/components/activity-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { activities, getFeaturedActivities, getActivitiesWithDeals } from "@/data/activities";
import { getAverageRating, getBestPrice } from "@/lib/types";
import { getCurrentSeason, getSeasonColors, getSeasonHeroText, getSeasonEmoji, getSeasonLabel } from "@/lib/seasons";
import { useAgeGroup } from "@/context/age-group-context";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  outdoor: <Mountain className="h-8 w-8" />,
  culture: <Landmark className="h-8 w-8" />,
  adventure: <Zap className="h-8 w-8" />,
  family: <Users className="h-8 w-8" />,
  wellness: <Heart className="h-8 w-8" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  outdoor: "from-green-500 to-emerald-600",
  culture: "from-purple-500 to-indigo-600",
  adventure: "from-orange-500 to-red-600",
  family: "from-blue-500 to-cyan-600",
  wellness: "from-pink-500 to-rose-600",
};

export default function HomePage() {
  const season = getCurrentSeason();
  const colors = getSeasonColors(season);
  const heroText = getSeasonHeroText(season);
  const featured = getFeaturedActivities();
  const deals = getActivitiesWithDeals();
  const { ageGroup } = useAgeGroup();

  const seasonalActivities = activities
    .filter((a) => a.seasons.includes(season))
    .sort((a, b) => getAverageRating(b) - getAverageRating(a))
    .slice(0, 8);

  const freeActivities = activities.filter((a) => getBestPrice(a, ageGroup) === 0).slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${colors.gradient} py-20 md:py-32`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white text-sm backdrop-blur-sm border-white/30">
            {getSeasonEmoji(season)} {getSeasonLabel(season)} {new Date().getFullYear()}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {heroText.title}
          </h1>
          <p className="mt-4 text-lg text-white/90 md:text-xl">
            {heroText.subtitle}
          </p>
          <div className="mt-8 mx-auto max-w-xl">
            <SearchBar placeholder="What do you want to do in Switzerland?" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/budget">
              <Button variant="secondary" className="rounded-full gap-2">
                <Wallet className="h-4 w-4" /> Budget Explorer
              </Button>
            </Link>
            <Link href="/surprise">
              <Button variant="secondary" className="rounded-full gap-2">
                <Shuffle className="h-4 w-4" /> Surprise Me
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Browse by Category</h2>
        <p className="mt-2 text-gray-500">Find the perfect activity for your interests</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {["outdoor", "culture", "adventure", "family", "wellness"].map((cat) => (
            <Link key={cat} href={`/activities?category=${cat}`}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className={`rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[cat]} p-4 text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {CATEGORY_ICONS[cat]}
                  </div>
                  <span className="font-semibold capitalize text-gray-900">{cat}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {activities.filter((a) => a.category === cat).length} activities
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Activities */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Featured Activities</h2>
              <p className="mt-2 text-gray-500">Hand-picked highlights across Switzerland</p>
            </div>
            <Link href="/activities">
              <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 8).map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </section>

      {/* In Season Now */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {getSeasonEmoji(season)} In Season Now
            </h2>
            <p className="mt-2 text-gray-500">Top-rated activities available this {getSeasonLabel(season).toLowerCase()}</p>
          </div>
          <Link href={`/activities?season=${season}`}>
            <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seasonalActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      {/* Free Activities */}
      {freeActivities.length > 0 && (
        <section className="bg-green-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Free Activities</h2>
                <p className="mt-2 text-gray-500">Amazing experiences that cost nothing</p>
              </div>
              <Link href="/activities?maxPrice=0">
                <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {freeActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deals Section */}
      {deals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Current Deals</h2>
              <p className="mt-2 text-gray-500">Special offers and discounts</p>
            </div>
            <Link href="/deals">
              <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700">
                All deals <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {deals.slice(0, 4).map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Banner */}
      <NewsletterSignup variant="banner" />

      {/* CTA Section */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">Not sure what to do?</h2>
          <p className="mt-3 text-gray-300">
            Use our Budget Explorer to find activities within your price range,
            or let us surprise you with a random pick.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/budget">
              <Button size="lg" className="rounded-full bg-red-600 hover:bg-red-700 gap-2">
                <Wallet className="h-5 w-5" /> Budget Explorer
              </Button>
            </Link>
            <Link href="/surprise">
              <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10 gap-2">
                <Shuffle className="h-5 w-5" /> Surprise Me
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

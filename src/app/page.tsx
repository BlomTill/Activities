"use client";

import Link from "next/link";
import {
  Mountain,
  Landmark,
  Zap,
  Users,
  Heart,
  ArrowRight,
  Shuffle,
  Wallet,
  MapPin,
  Route,
  Tag,
  Train,
  Sparkles,
  Compass,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { TrendingBar } from "@/components/trending-bar";
import { RecentlyViewed } from "@/components/recently-viewed";
import { ParallaxHero } from "@/components/immersive/parallax-hero";
import { ScrollReveal } from "@/components/immersive/scroll-reveal";
import { ChapterHeader } from "@/components/immersive/chapter";
import { SnowLayer } from "@/components/immersive/snow-layer";
import { activities, getFeaturedActivities, getActivitiesWithDeals } from "@/data/activities";
import { getAverageRating, getBestPrice } from "@/lib/types";
import { getCurrentSeason, getSeasonHeroText, getSeasonEmoji, getSeasonLabel } from "@/lib/seasons";
import { TRIP_PROFILES } from "@/lib/trip-tools";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  outdoor: <Mountain className="h-8 w-8" />,
  culture: <Landmark className="h-8 w-8" />,
  adventure: <Zap className="h-8 w-8" />,
  family: <Users className="h-8 w-8" />,
  wellness: <Heart className="h-8 w-8" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  outdoor: "from-emerald-500 to-teal-700",
  culture: "from-violet-500 to-indigo-700",
  adventure: "from-orange-500 to-rose-700",
  family: "from-sky-500 to-cyan-700",
  wellness: "from-pink-500 to-rose-600",
};

const CATEGORY_POEMS: Record<string, string> = {
  outdoor: "Where trails breathe with pine and glacier air.",
  culture: "Cobbled lanes, cuckoo clocks and quiet museums.",
  adventure: "When the mountain calls, and the rope is ready.",
  family: "Little adventures, big memories.",
  wellness: "Thermal springs, fresh snow, and a long, slow breath.",
};

const SERVICES = [
  {
    title: "Compare Activities",
    tag: "the map",
    description:
      "See top picks across Switzerland, compare providers side-by-side, and book with real confidence.",
    href: "/activities",
    icon: <Mountain className="h-5 w-5" />,
  },
  {
    title: "Explore Destinations",
    tag: "the valleys",
    description:
      "Wander Swiss regions first — then unfold the best activities, guides, and itineraries in each.",
    href: "/destinations",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "Ready-Made Itineraries",
    tag: "the thread",
    description:
      "Start from proven routes crafted for travellers like you — instead of planning every stop from zero.",
    href: "/itineraries",
    icon: <Route className="h-5 w-5" />,
  },
  {
    title: "Plan by Budget",
    tag: "the purse",
    description:
      "Know what fits your price range before the trip shapes itself around a hidden surprise.",
    href: "/budget",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: "Swiss Travel Passes",
    tag: "the train",
    description:
      "Find out if a pass actually saves money for your travel style — before you pay for one you don't need.",
    href: "/travel-passes",
    icon: <Train className="h-5 w-5" />,
  },
  {
    title: "Hand-picked Deals",
    tag: "the gift",
    description:
      "Quietly useful offers. No screaming banners, no discount-wall clutter — just value when it exists.",
    href: "/deals",
    icon: <Tag className="h-5 w-5" />,
  },
];

const PROMISE_POINTS = [
  {
    title: "No filler",
    body: "Only activities we'd recommend to a friend visiting for the first time.",
  },
  {
    title: "Prices that match reality",
    body: "Student, family and group rates shown up front — fewer surprises at the counter.",
  },
  {
    title: "Four-season thinking",
    body: "Summer hikes, snow-covered passes, autumn vines, spring thaw — planned for when you go.",
  },
  {
    title: "Locally grounded",
    body: "Built by people who actually ride SBB trains and hike these trails, not a content farm.",
  },
];

const VOICES = [
  {
    quote:
      "I opened the map, picked a valley I'd never heard of, and ended up on the best weekend of my year.",
    author: "Mira",
    where: "Berlin → Engadin",
  },
  {
    quote:
      "Finally a Swiss travel site that tells me a Half-Fare Card makes no sense for a 3-day trip.",
    author: "Ben",
    where: "London → Zürich",
  },
  {
    quote:
      "It feels less like a booking site and more like a friend who knows the good trails.",
    author: "Amélie",
    where: "Paris → Valais",
  },
];

export default function HomePage() {
  const season = getCurrentSeason();
  const heroText = getSeasonHeroText(season);
  const featured = getFeaturedActivities();
  const deals = getActivitiesWithDeals();

  const seasonalActivities = activities
    .filter((a) => a.seasons.includes(season))
    .sort((a, b) => getAverageRating(b) - getAverageRating(a))
    .slice(0, 8);

  const freeActivities = activities.filter((a) => getBestPrice(a, "adult") === 0).slice(0, 4);

  const heroRightPanel = (
    <div className="surface-frost relative rounded-[32px] p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
          <Sparkles className="h-4 w-4" />
          Where shall we begin?
        </div>
        <span className="chapter-num text-xs">Prologue</span>
      </div>
      <div className="mt-5 space-y-3">
        {SERVICES.slice(0, 4).map((service, i) => (
          <Link
            key={service.title}
            href={service.href}
            className={`group flex items-start justify-between rounded-2xl border border-white/70 bg-white/85 p-4 transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md animate-fade-up stagger-${i + 2}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 text-red-600">
                {service.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{service.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {service.description.split(".")[0]}.
                </p>
              </div>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-red-500" />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {/* ─────────── Hero · Prologue ─────────── */}
      <ParallaxHero
        season={season}
        badge={`${getSeasonEmoji(season)} ${getSeasonLabel(season)} ${new Date().getFullYear()} · An invitation`}
        title={
          <>
            <span className="block text-slate-800/90 text-3xl md:text-4xl font-story italic font-light">
              Once upon a country of
            </span>
            <span className="text-gradient-swiss">{heroText.title}</span>
          </>
        }
        subtitle={heroText.subtitle}
        rightPanel={heroRightPanel}
      />

      {/* Trending Now — quiet transition */}
      <TrendingBar />

      {/* ─────────── Chapter I · What Awaits ─────────── */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ChapterHeader
          number="I"
          eyebrow="The invitation"
          title={
            <>
              Switzerland, told as <span className="text-gradient-swiss">six small doors</span>.
            </>
          }
          lede="We split this big, beautiful country into a handful of clear paths — instead of one overwhelming feed. Choose the door that matches your mood, and we'll take it from there."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ScrollReveal
              key={service.title}
              direction="up"
              delay={i * 90}
              className="group"
            >
              <Card className="relative h-full overflow-hidden border border-slate-100/80 bg-white/90 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.2)] transition-all hover-lift">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-400 via-amber-400 to-red-600 opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="relative p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 via-amber-50 to-white text-red-600 shadow-inner">
                      {service.icon}
                    </div>
                    <span className="story-eyebrow text-xs italic text-slate-400">
                      /{service.tag}
                    </span>
                  </div>
                  <h3 className="story-title mt-5 text-2xl text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {service.description}
                  </p>
                  <Link href={service.href}>
                    <Button
                      variant="alpine"
                      size="sm"
                      className="mt-6 gap-1.5 rounded-full px-5"
                    >
                      Open the door <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─────────── Chapter II · Quick Starts ─────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-glacier opacity-60" aria-hidden />
        <div className="topo-lines absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-24">
          <ChapterHeader
            number="II"
            eyebrow="The shortcut"
            title={
              <>
                Already know your pace? <span className="text-gradient-alpine">Take a shortcut.</span>
              </>
            }
            lede="Three well-worn openings, picked by travel style. You can still detour whenever something catches your eye."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {TRIP_PROFILES.map((profile, i) => (
              <ScrollReveal key={profile.id} direction="up" delay={i * 120}>
                <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-md shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition-all hover-lift">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-red-100 to-amber-100 blur-2xl opacity-70 transition-all group-hover:scale-110" />
                  <CardContent className="relative p-7">
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-100">
                        {profile.days} day{profile.days > 1 ? "s" : ""}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-500">
                        from <span className="text-slate-900">CHF {profile.budget}</span>
                      </span>
                    </div>
                    <h3 className="story-title mt-5 text-2xl text-slate-900">
                      {profile.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {profile.summary}
                    </p>
                    <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5" />
                        {profile.seasonMode === "current" ? "In-season picks" : "All-season planning"}
                      </span>
                      <Link href={profile.href}>
                        <Button variant="alpine" size="sm" className="gap-1 rounded-full px-4">
                          Begin <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Chapter III · Categories (Moods) ─────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ChapterHeader
          number="III"
          eyebrow="Your mood"
          title={
            <>
              What kind of trip <span className="text-gradient-swiss">is this one?</span>
            </>
          }
          lede="Every journey has its own weather. Pick a feeling and we'll surface the activities that match it."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {["outdoor", "culture", "adventure", "family", "wellness"].map((cat, i) => (
            <ScrollReveal key={cat} direction="zoom" delay={i * 80}>
              <Link href={`/activities?category=${cat}`}>
                <Card className="group relative h-full cursor-pointer overflow-hidden border-0 bg-white/95 shadow-sm transition-all hover-lift sheen">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div
                      className={`relative rounded-2xl bg-gradient-to-br ${CATEGORY_GRADIENTS[cat]} p-5 text-white mb-4 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />
                      <div className="relative">{CATEGORY_ICONS[cat]}</div>
                    </div>
                    <span className="story-title text-lg capitalize text-slate-900">{cat}</span>
                    <span className="mt-1.5 text-[11px] italic leading-4 text-slate-500 line-clamp-2 story-eyebrow">
                      {CATEGORY_POEMS[cat]}
                    </span>
                    <span className="mt-3 text-xs font-medium text-red-600/80">
                      {activities.filter((a) => a.category === cat).length} activities →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─────────── Chapter IV · Featured ─────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-20 md:py-24">
        <div className="mountain-divider absolute inset-x-0 top-0 rotate-180 opacity-70" aria-hidden />
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <ChapterHeader
              number="IV"
              eyebrow="The highlights"
              title={
                <>
                  Postcards from the road — <span className="text-gradient-swiss">hand-picked</span>
                </>
              }
              lede="A shortlist of experiences we return to, across seasons and cantons. The ones we'd send in a postcard."
            />
            <Link href="/activities" className="mb-1">
              <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700 link-flourish">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 8).map((activity, i) => (
              <ScrollReveal key={activity.id} direction="up" delay={i * 70}>
                <ActivityCard activity={activity} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed title="Continue your story" />

      {/* ─────────── Chapter V · In Season ─────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {season === "winter" && (
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <SnowLayer count={24} density={0.7} />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <ChapterHeader
              number="V"
              eyebrow="This very season"
              title={
                <>
                  {getSeasonEmoji(season)} Right now, {getSeasonLabel(season).toLowerCase()} is showing off
                </>
              }
              lede={`Top-rated experiences at their best during this ${getSeasonLabel(season).toLowerCase()} — before the weather turns the page.`}
            />
            <Link href={`/activities?season=${season}`} className="mb-1">
              <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700 link-flourish">
                See all {getSeasonLabel(season).toLowerCase()} picks <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {seasonalActivities.map((activity, i) => (
              <ScrollReveal key={activity.id} direction="up" delay={i * 70}>
                <ActivityCard activity={activity} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Chapter VI · Voices ─────────── */}
      <section className="relative overflow-hidden bg-alpine-dusk py-24">
        <div className="aurora animate-aurora" />
        <div className="silhouette-range pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-80" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4">
          <ChapterHeader
            number="VI"
            eyebrow="Voices from the trail"
            align="center"
            title={
              <span className="text-white">What other travellers are whispering</span>
            }
            lede={
              <span className="text-slate-300">
                We don't pretend these are every story. Just the ones that made us pay attention.
              </span>
            }
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {VOICES.map((v, i) => (
              <ScrollReveal key={v.author} direction="up" delay={i * 120}>
                <div className="surface-night group relative h-full rounded-3xl p-7 transition-all hover-lift">
                  <Quote className="h-7 w-7 text-red-400/80" />
                  <p className="mt-4 text-base leading-7 text-slate-100/90">
                    “{v.quote}”
                  </p>
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-white">{v.author}</div>
                      <div className="text-xs uppercase tracking-widest text-slate-400">
                        {v.where}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-300">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Chapter VII · Free Experiences ─────────── */}
      {freeActivities.length > 0 && (
        <section className="relative overflow-hidden bg-emerald-50/60 py-20 md:py-24">
          <div className="topo-lines absolute inset-0 opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <ChapterHeader
                number="VII"
                eyebrow="The free chapter"
                title={
                  <>
                    The best things in the Alps, <span className="text-gradient-alpine">cost nothing</span>
                  </>
                }
                lede="Lakeside walks, viewpoint benches, open-air moments — built into the landscape, no ticket required."
              />
              <Link href="/activities?maxPrice=0" className="mb-1">
                <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700 link-flourish">
                  View all free picks <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {freeActivities.map((activity, i) => (
                <ScrollReveal key={activity.id} direction="up" delay={i * 70}>
                  <ActivityCard activity={activity} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Chapter VIII · Promise / Why us ─────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <ChapterHeader
          number="VIII"
          eyebrow="Our promise"
          title={
            <>
              Less noise, more <span className="text-gradient-swiss">actual mountain</span>
            </>
          }
          lede="A quiet pitch for why you can trust us with your trip."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PROMISE_POINTS.map((p, i) => (
            <ScrollReveal key={p.title} direction="up" delay={i * 100}>
              <div className="relative h-full rounded-3xl border border-slate-100 bg-white/90 p-7 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.3)] transition-all hover-lift">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-amber-50 text-red-600">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <h3 className="story-title mt-5 text-xl text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{p.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─────────── Deals ─────────── */}
      {deals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <ChapterHeader
              number="IX"
              eyebrow="Good timing"
              title={
                <>
                  Quiet offers, <span className="text-gradient-swiss">worth a look</span>
                </>
              }
              lede="Seasonal deals we'd actually act on — not the ones that exist only to look like deals."
            />
            <Link href="/deals" className="mb-1">
              <Button variant="ghost" className="gap-1 text-red-600 hover:text-red-700 link-flourish">
                All deals <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {deals.slice(0, 4).map((activity, i) => (
              <ScrollReveal key={activity.id} direction="up" delay={i * 70}>
                <ActivityCard activity={activity} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSignup variant="banner" />

      {/* ─────────── Epilogue / CTA ─────────── */}
      <section className="relative overflow-hidden bg-alpine-dusk py-24 text-white">
        <div className="aurora animate-aurora" />
        <div className="silhouette-range pointer-events-none absolute inset-x-0 bottom-0 h-44 opacity-90" aria-hidden />
        <SnowLayer count={14} density={0.6} className="opacity-40" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="kicker kicker-center justify-center">
            <span className="chapter-num text-white/80">Epilogue</span>
          </div>
          <h2 className="story-title mt-5 text-4xl leading-tight md:text-5xl">
            Still deciding?
            <span className="mt-2 block text-gradient-swiss">Let Switzerland decide for you.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-200/90">
            Tell us your budget and we'll find the fit. Or close your eyes, spin the compass,
            and let a surprise pick you.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/budget">
              <Button variant="alpine" size="xl" className="gap-2">
                <Wallet className="h-5 w-5" /> Plan by budget
              </Button>
            </Link>
            <Link href="/surprise">
              <Button variant="snow" size="xl" className="gap-2">
                <Shuffle className="h-5 w-5" /> Surprise me
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-400">
            <span className="h-px w-8 bg-slate-500/60" />
            <span>fin</span>
            <span className="h-px w-8 bg-slate-500/60" />
          </div>
        </div>
      </section>
    </div>
  );
}

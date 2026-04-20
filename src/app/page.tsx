"use client";

import Link from "next/link";
import {
  ArrowRight,
  Map,
  Calendar,
  Compass,
  Sparkles,
  Star,
  ShieldCheck,
  Wallet,
  Quote,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/activity-card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ScrollReveal } from "@/components/immersive/scroll-reveal";
import { activities, getFeaturedActivities } from "@/data/activities";
import { blogPosts } from "@/data/blog-posts";
import { getCurrentSeason, getSeasonLabel } from "@/lib/seasons";

/**
 * ──────────────────────────────────────────────────────────────────
 *  Editorial landing page
 *
 *  Quiet, 5-scroll structure:
 *    1. Editorial hero        — one photo, one sentence, one CTA
 *    2. Three doors           — Destinations / Experience / Plan
 *    3. Featured story        — latest editorial piece
 *    4. In-season picks       — 4 activities that are good RIGHT NOW
 *    5. Trust + newsletter    — social proof + list sign-up
 *
 *  The old cinematic storybook experience still exists in the codebase
 *  via the ParallaxHero component — we use a quieter hero here so the
 *  homepage loads fast and feels calm.
 * ──────────────────────────────────────────────────────────────────
 */

const DOORS = [
  {
    href: "/destinations",
    label: "Destinations",
    line: "Start with the region that matches your mood.",
    icon: <Map className="h-5 w-5" />,
  },
  {
    href: "/activities",
    label: "Experience",
    line: "Handpicked activities, sorted by season and budget.",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    href: "/plan",
    label: "Plan",
    line: "Itineraries, travel passes, and honest budget math.",
    icon: <Calendar className="h-5 w-5" />,
  },
];

const TRUST = [
  {
    icon: <Wallet className="h-5 w-5 text-emerald-600" />,
    label: "Transparent pricing",
    desc: "Every activity shows the official operator price — no inflated markups.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
    label: "Editorially independent",
    desc: "Partners can't pay to be featured. Rankings are based on quality, not commission.",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    label: "Written by travellers",
    desc: "Guides come from people who've actually done the routes — not SEO factories.",
  },
];

export default function HomePage() {
  const season = getCurrentSeason();
  const seasonLabel = getSeasonLabel(season);
  const featured = getFeaturedActivities().slice(0, 4);
  const inSeason = activities
    .filter((a) => a.seasons.includes(season))
    .slice(0, 4);
  const latestStory = blogPosts[0];

  return (
    <>
      {/* ── 1. Editorial hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] overflow-hidden bg-stone-950 text-white">
        <Image
          src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=2000&h=1200&fit=crop&q=80"
          alt="Alpine landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/20 to-stone-950/80" />

        <div className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col justify-end px-6 py-16">
          <ScrollReveal>
            <div className="text-xs uppercase tracking-[0.3em] text-white/70 mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-white/60" />
              {seasonLabel} in Switzerland
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] max-w-4xl">
              <span className="italic">Switzerland,</span> made simple —
              and worth the money.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
              A quiet guide to the best experiences in the Alps, without the
              overwhelm. Every route, pass, and price — in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="alpine">
                <Link href="/activities">
                  Explore activities <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <Link href="/itineraries">Ready-made itineraries</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 2. Three doors ─────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-12 max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Three ways in
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 leading-tight">
                Whatever you&apos;re here for, there&apos;s a clean path to it.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {DOORS.map((d, idx) => (
              <ScrollReveal key={d.href} delay={idx * 100}>
                <Link
                  href={d.href}
                  className="group block h-full rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-gray-900 hover:shadow-lg"
                >
                  <div className="inline-flex items-center justify-center rounded-xl bg-gray-900 p-3 text-white transition group-hover:-rotate-3">
                    {d.icon}
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-gray-900">
                    {d.label}
                  </h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{d.line}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 group-hover:gap-2.5 transition-all">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Featured story ──────────────────────────────────────────── */}
      {latestStory && (
        <section className="relative bg-stone-50 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200&h=1600&fit=crop"
                  alt="Swiss story"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                The featured story
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight">
                {latestStory.title}
              </h2>
              <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                {latestStory.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                <span>{latestStory.author}</span>
                <span>&middot;</span>
                <span>
                  {new Date(latestStory.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <Button asChild className="mt-8" variant="alpine" size="lg">
                <Link href={`/stories/${latestStory.slug}`}>
                  Read the full story <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── 4. In-season picks ─────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Good right now &middot; {seasonLabel}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-gray-900">
                  At their best this {seasonLabel.toLowerCase()}.
                </h2>
              </div>
              <Link
                href="/activities"
                className="hidden items-center gap-1 text-sm font-medium text-red-700 hover:gap-2 transition-all md:inline-flex"
              >
                All activities <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {inSeason.map((a, idx) => (
              <ScrollReveal key={a.id} delay={idx * 75}>
                <ActivityCard activity={a} />
              </ScrollReveal>
            ))}
          </div>

          {featured.length > 0 && (
            <div className="mt-20">
              <ScrollReveal>
                <div className="mb-8">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Editor&apos;s picks
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl text-gray-900">
                    A handful of things we love.
                  </h2>
                </div>
              </ScrollReveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((a, idx) => (
                  <ScrollReveal key={a.id} delay={idx * 75}>
                    <ActivityCard activity={a} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Trust + newsletter ──────────────────────────────────────── */}
      <section className="bg-stone-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-16 md:grid-cols-[1.2fr_1fr]">
            <ScrollReveal>
              <div className="text-xs uppercase tracking-wider text-white/60 mb-4">
                Why trust us
              </div>
              <h2 className="font-serif text-4xl text-white leading-tight max-w-xl">
                <span className="italic">No hype.</span> No hidden fees. No
                affiliate-padded rankings.
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {TRUST.map((t) => (
                  <div key={t.label}>
                    <div className="inline-flex rounded-lg bg-white/10 p-2 mb-3">
                      {t.icon}
                    </div>
                    <div className="font-medium text-white">{t.label}</div>
                    <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-4 text-sm text-white/70">
                <Quote className="h-5 w-5 text-white/40 shrink-0" />
                <p className="italic">
                  &quot;The clearest guide to the Alps I&apos;ve used. The pass
                  maths alone saved us CHF 180.&quot;
                  <span className="ml-2 not-italic text-white/50">
                    — Maya, early reader
                  </span>
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10">
                <NewsletterSignup />
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-white/50">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                One email a month. Curated, never spammy.
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Quiet footer nudge ─────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-3">
            Still exploring?
          </p>
          <p className="font-serif text-2xl text-gray-900 mb-6">
            Try the <Link href="/surprise" className="text-red-700 underline-offset-4 hover:underline">surprise</Link> button.
            Or read our <Link href="/partners" className="text-red-700 underline-offset-4 hover:underline">transparency notes</Link>.
          </p>
          <div className="inline-flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">No ads</Badge>
            <Badge variant="secondary">No paid rankings</Badge>
            <Badge variant="secondary">Human-written</Badge>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Route, Sparkles, Snowflake, Mountain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search-bar";
import { SnowLayer } from "@/components/immersive/snow-layer";
import { cn } from "@/lib/utils";

interface ParallaxHeroProps {
  season: "winter" | "spring" | "summer" | "autumn";
  badge: string;
  title: React.ReactNode;
  subtitle: string;
  rightPanel?: React.ReactNode;
}

/**
 * A layered hero:
 *  - Sky with animated aurora / soft pulses
 *  - Three mountain silhouette layers moving at different parallax speeds
 *  - A cable car that glides across on a wire
 *  - Snow (winter only)
 *  - Storybook-style title with reveal mask
 */
export function ParallaxHero({ season, badge, title, subtitle, rightPanel }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setPointer({ x, y });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const el = ref.current;
    el?.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      el?.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Sky gradient per season
  const skyClass =
    season === "winter"
      ? "bg-alpine-day"
      : season === "autumn"
      ? "bg-alpine-dawn"
      : season === "spring"
      ? "bg-alpine-day"
      : "bg-alpine-day"; // summer

  const sunColor =
    season === "autumn"
      ? "from-amber-300/70 to-rose-300/40"
      : season === "winter"
      ? "from-sky-200/70 to-indigo-200/30"
      : season === "spring"
      ? "from-lime-200/70 to-sky-200/40"
      : "from-amber-200/80 to-orange-200/40";

  const py = Math.min(scrollY * 0.15, 80);
  const py2 = Math.min(scrollY * 0.3, 140);
  const py3 = Math.min(scrollY * 0.5, 220);

  return (
    <section
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden",
        skyClass,
        "pt-24 pb-40 md:pt-32 md:pb-56"
      )}
    >
      {/* Aurora / ambient */}
      <div className="aurora animate-aurora" />
      <div className={`absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b ${sunColor} blur-3xl animate-soft-pulse`} />
      <div className="soft-grid absolute inset-0 opacity-25" />

      {/* Distant peaks */}
      <svg
        className="parallax-layer absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        style={{ height: "62%", transform: `translate3d(${pointer.x * -6}px, ${-py * 0.3}px, 0)` }}
        aria-hidden
      >
        <defs>
          <linearGradient id="peakA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <path
          fill="url(#peakA)"
          d="M0,360 L0,230 L120,170 L220,220 L340,130 L480,210 L600,150 L740,230 L880,140 L1020,210 L1160,160 L1280,220 L1440,170 L1440,360 Z"
        />
        {/* snow caps */}
        <path
          fill="#f8fafc"
          opacity="0.9"
          d="M340,130 L360,150 L380,138 L400,158 L460,200 L420,180 L400,160 L380,150 L340,130 Z
             M880,140 L910,162 L940,150 L880,140 Z
             M1280,220 L1300,205 L1320,218 L1280,220 Z"
        />
      </svg>

      {/* Mid peaks */}
      <svg
        className="parallax-layer absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        style={{ height: "52%", transform: `translate3d(${pointer.x * -12}px, ${-py2 * 0.25}px, 0)` }}
        aria-hidden
      >
        <defs>
          <linearGradient id="peakB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path
          fill="url(#peakB)"
          d="M0,360 L0,260 L120,210 L260,280 L380,180 L520,270 L660,200 L800,290 L940,180 L1080,260 L1220,200 L1360,280 L1440,240 L1440,360 Z"
        />
        <path
          fill="#f1f5f9"
          opacity="0.85"
          d="M380,180 L400,205 L420,192 L440,220 L400,205 L380,180 Z
             M940,180 L970,210 L990,195 L940,180 Z"
        />
      </svg>

      {/* Foreground forested ridge */}
      <svg
        className="parallax-layer absolute inset-x-0 bottom-0 w-full"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        style={{ height: "42%", transform: `translate3d(${pointer.x * -20}px, ${-py3 * 0.18}px, 0)` }}
        aria-hidden
      >
        <defs>
          <linearGradient id="peakC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#peakC)"
          d="M0,360 L0,300 L90,270 L180,310 L280,250 L380,320 L480,270 L580,330 L680,260 L800,330 L920,270 L1040,320 L1160,280 L1280,330 L1380,290 L1440,320 L1440,360 Z"
        />
      </svg>

      {/* Cable car line with gondola */}
      <div className="pointer-events-none absolute left-0 right-0 top-[32%] h-[1px] bg-gradient-to-r from-transparent via-slate-400/60 to-transparent" aria-hidden />
      <div
        className="gondola animate-cable"
        style={{ top: "31%", width: "100%", left: 0, height: 0 }}
        aria-hidden
      >
        <div className="relative">
          <div className="absolute -top-1 h-1 w-6 -translate-x-1/2 rounded-sm bg-slate-600" />
          <div className="absolute top-0 flex -translate-x-1/2 flex-col items-center">
            <div className="h-3 w-[1px] bg-slate-500" />
            <div className="flex h-5 w-10 items-center justify-center rounded-b-xl rounded-t-md bg-red-600 text-[8px] font-bold text-white shadow-md">
              <Mountain className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Snow if winter */}
      {season === "winter" && <SnowLayer count={32} />}

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-slate-900">
            <Badge className="animate-fade-up mb-5 border-white/60 bg-white/70 text-sm text-red-700 backdrop-blur-md shadow-sm">
              <span className="flag-dot" /> {badge}
            </Badge>

            <h1 className="story-title animate-fade-up stagger-1 text-balance text-5xl leading-[1.02] md:text-7xl">
              {title}
            </h1>

            <p className="animate-fade-up stagger-2 mt-6 max-w-2xl text-lg text-slate-700 md:text-xl drop-cap">
              {subtitle}
            </p>

            <div className="animate-fade-up stagger-3 mt-8 max-w-xl">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-1.5 shadow-[0_10px_40px_-18px_rgba(15,23,42,0.35)] backdrop-blur-lg">
                <SearchBar placeholder="Search a valley, peak, city, or dream…" />
              </div>
            </div>

            <div className="animate-fade-up stagger-4 mt-6 flex flex-wrap items-center gap-3">
              <Link href="/destinations" className="group">
                <button className="btn-alpine group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                  <MapPin className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                  Begin the Journey
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link href="/planner">
                <button className="sheen inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
                  <Route className="h-4 w-4" />
                  Write your itinerary
                </button>
              </Link>
              <Link href="/surprise" className="hidden sm:block">
                <span className="link-flourish inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Surprise me instead
                </span>
              </Link>
            </div>

            <div className="animate-fade-up stagger-5 mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Snowflake className="h-3.5 w-3.5" /> 4 seasons
              </span>
              <span>·</span>
              <span>26 cantons</span>
              <span>·</span>
              <span>∞ stories</span>
            </div>
          </div>

          {rightPanel && (
            <div className="animate-fade-up stagger-5">{rightPanel}</div>
          )}
        </div>
      </div>

      {/* Fading bottom edge into page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
}

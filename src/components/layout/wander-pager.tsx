"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface PageEntry {
  key: string;
  label: string;
  href: string;
  // Pages that should still highlight this entry (prefix match)
  match?: string[];
}

const PAGES: PageEntry[] = [
  { key: "home", label: "Home", href: "/", match: [] },
  { key: "activities", label: "Activities", href: "/activities" },
  { key: "itineraries", label: "Trips", href: "/itineraries" },
  { key: "stories", label: "Stories", href: "/stories", match: ["/blog"] },
  { key: "destinations", label: "Places", href: "/destinations", match: ["/regions"] },
  { key: "map", label: "Map", href: "/map" },
];

interface OverlayEntry {
  num: string;
  name: string;
  desc: string;
  href: string;
}

const OVERLAY: OverlayEntry[] = [
  { num: "01", name: "Home",          desc: "The starting line.",                   href: "/" },
  { num: "02", name: "Activities",    desc: "215+ hand-picked Swiss adventures.",   href: "/activities" },
  { num: "03", name: "Itineraries",   desc: "Curated multi-day routes.",            href: "/itineraries" },
  { num: "04", name: "Stories",       desc: "Field guides & honest reviews.",       href: "/stories" },
  { num: "05", name: "Destinations",  desc: "Every Swiss town worth a stop.",       href: "/destinations" },
  { num: "06", name: "Map",           desc: "Activities plotted across CH.",        href: "/map" },
  { num: "07", name: "Deals",         desc: "Discounts & free entries.",            href: "/deals" },
  { num: "08", name: "Travel passes", desc: "Swiss Travel Pass, decoded.",          href: "/travel-passes" },
  { num: "09", name: "Compare",       desc: "Side-by-side decision helper.",        href: "/compare" },
  { num: "10", name: "Budget",        desc: "What a Swiss week actually costs.",    href: "/budget" },
  { num: "11", name: "Trip planner",  desc: "Build your route day by day.",         href: "/planner" },
  { num: "12", name: "Surprise me",   desc: "One-click random adventure.",          href: "/surprise" },
  { num: "13", name: "About",         desc: "Why we built this.",                   href: "/about" },
  { num: "14", name: "Partners",      desc: "Who we work with.",                    href: "/partners" },
  { num: "15", name: "Privacy",       desc: "What we collect, what we don't.",      href: "/privacy" },
];

export function WanderPager() {
  const pathname = usePathname();
  const [overlayOpen, setOverlayOpen] = useState(false);

  function isActive(p: PageEntry) {
    if (p.key === "home") return pathname === "/";
    const matchers = [p.href, ...(p.match ?? [])];
    return matchers.some((m) => pathname === m || pathname.startsWith(m + "/"));
  }

  return (
    <>
      <div className="wander-pager" role="navigation" aria-label="Quick page jump">
        {PAGES.map((p) => (
          <Link
            key={p.key}
            href={p.href}
            className={isActive(p) ? "on" : undefined}
          >
            {p.label}
          </Link>
        ))}
        <button
          type="button"
          className="more"
          onClick={() => setOverlayOpen(true)}
          aria-haspopup="dialog"
        >
          All →
        </button>
      </div>

      {overlayOpen && (
        <div
          className="wander-page-grid-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="All pages"
        >
          <button
            type="button"
            className="pgo-close"
            onClick={() => setOverlayOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          <div className="pgo-inner">
            <span className="wander-kicker">
              <span className="bar" />
              All pages
            </span>
            <h2 className="pgo-title">Where do you want to go?</h2>
            <div className="pgo-grid">
              {OVERLAY.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="pgo-card"
                  onClick={() => setOverlayOpen(false)}
                >
                  <div className="num">{p.num}</div>
                  <div className="name">{p.name}</div>
                  <div className="desc">{p.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

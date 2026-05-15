"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWanderTheme } from "./theme-provider";
import { triggerYodel } from "./yodel";
import { isFeatureEnabled, isRouteEnabled } from "@/lib/constants";
import { HeaderSearch } from "./header-search";

/**
 * realswitzerland.ch sticky header.
 * - Cream blurred backdrop
 * - Logo with orange triangle mark + .ch dot accent
 * - Centre nav links (hidden on mobile)
 * - Theme (sun) toggle + EN·CHF chip + "Plan a trip" CTA
 * - "More" mega-dropdown with grouped links + editor's pick card
 * - 5x logo click triggers yodel/confetti easter egg
 */

interface NavLink {
  label: string;
  href: string;
  match?: string[]; // pathnames that should highlight this link
}

/**
 * Launch mode — keeps the public surface small for the initial release.
 * Set NEXT_PUBLIC_LAUNCH_MODE=full in .env.local to expose the full nav
 * once Stories / Itineraries / Map / Deals are content-complete.
 */
const LAUNCH_MODE = (process.env.NEXT_PUBLIC_LAUNCH_MODE ?? "lean") !== "full";

const NAV_LINKS_LEAN: NavLink[] = [
  { label: "Activities", href: "/activities", match: ["/activities"] },
  { label: "Compare", href: "/compare", match: ["/compare"] },
  { label: "Destinations", href: "/destinations", match: ["/destinations", "/regions"] },
];

const NAV_LINKS_FULL: NavLink[] = [
  { label: "Activities", href: "/activities", match: ["/activities"] },
  { label: "Itineraries", href: "/itineraries", match: ["/itineraries"] },
  { label: "Stories", href: "/stories", match: ["/stories", "/blog"] },
  { label: "Destinations", href: "/destinations", match: ["/destinations", "/regions"] },
  { label: "Map", href: "/map" },
  { label: "Deals", href: "/deals" },
];

const NAV_LINKS: NavLink[] = (LAUNCH_MODE ? NAV_LINKS_LEAN : NAV_LINKS_FULL).filter(
  (l) => isRouteEnabled(l.href),
);

interface MegaGroup {
  head: string;
  links: { label: string; href: string }[];
}

const MEGA_GROUPS_LEAN: MegaGroup[] = [
  {
    head: "Compare",
    links: [
      { label: "All activities", href: "/activities" },
      { label: "Browse by region", href: "/destinations" },
      { label: "Side-by-side compare", href: "/compare" },
    ],
  },
  {
    head: "About",
    links: [
      { label: "How we make money", href: "/partners" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "/about" },
    ],
  },
];

const MEGA_GROUPS_FULL: MegaGroup[] = [
  {
    head: "Plan",
    links: [
      { label: "Trip planner", href: "/planner" },
      { label: "Budget calculator", href: "/budget" },
      { label: "Compare activities", href: "/compare" },
      { label: "Travel passes", href: "/travel-passes" },
      { label: "Surprise me", href: "/surprise" },
    ],
  },
  {
    head: "Discover",
    links: [
      { label: "All destinations", href: "/destinations" },
      { label: "Stories & guides", href: "/stories" },
      { label: "Today's deals", href: "/deals" },
      { label: "Interactive map", href: "/map" },
    ],
  },
  {
    head: "About",
    links: [
      { label: "Our mission", href: "/about" },
      { label: "Partners", href: "/partners" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

const MEGA_GROUPS: MegaGroup[] = (LAUNCH_MODE ? MEGA_GROUPS_LEAN : MEGA_GROUPS_FULL)
  .map((g) => ({ ...g, links: g.links.filter((l) => isRouteEnabled(l.href)) }))
  .filter((g) => g.links.length > 0);

const SHOW_EDITORS_PICK = isFeatureEnabled("ITINERARIES");

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 2 }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useWanderTheme();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 5x logo click → yodel banner + confetti
  const logoCount = useRef(0);
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // close mega on outside click
  const moreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!megaOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!moreRef.current) return;
      if (!moreRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [megaOpen]);

  function isActive(item: NavLink) {
    const matchers = item.match ?? [item.href];
    return matchers.some((m) => pathname === m || pathname.startsWith(m + "/"));
  }

  function onLogoClick(e: React.MouseEvent) {
    logoCount.current++;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    logoTimer.current = setTimeout(() => (logoCount.current = 0), 1800);
    if (logoCount.current >= 5) {
      e.preventDefault();
      logoCount.current = 0;
      triggerYodel();
    }
  }

  return (
    <>
      <header className="wander-nav">
        <div className="wander-container wander-nav-row">
          <Link href="/" onClick={onLogoClick} className="wander-logo" aria-label="realswitzerland.ch home">
            <span className="wander-logo-mark" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20 9 9l4 6 3-4 5 9z" />
              </svg>
            </span>
            <span className="wander-logo-text">
              wander<span className="dot">.</span>ch
            </span>
          </Link>

          <nav className="wander-nav-links wander-hide-mobile" aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item) ? "on" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <div ref={moreRef} className="wander-more-wrap">
              <button
                type="button"
                className={"wander-more-trigger" + (megaOpen ? " open" : "")}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                onClick={() => setMegaOpen((v) => !v)}
              >
                More <ChevronDownIcon />
              </button>
            </div>
          </nav>

          <div className="wander-nav-actions">
            <div className="wander-hide-mobile">
              <HeaderSearch />
            </div>
            <button
              type="button"
              onClick={toggle}
              className="wander-btn wander-btn-ghost wander-hide-mobile"
              aria-label={`Switch to ${theme === "day" ? "dusk" : "day"} theme`}
              title={theme === "day" ? "Day · click for dusk" : "Dusk · click for day"}
            >
              {theme === "day" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button type="button" className="wander-btn wander-btn-ghost wander-hide-mobile">
              EN · CHF
            </button>
            <button
              type="button"
              className="wander-btn wander-btn-primary"
              onClick={() => router.push("/activities")}
            >
              Plan a trip <ArrowRight />
            </button>
            <button
              type="button"
              className="wander-btn wander-btn-ghost wander-show-mobile"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {megaOpen && (
          <div className="wander-mega" role="region" aria-label="More navigation">
            <div className="wander-container wander-mega-grid">
              {MEGA_GROUPS.map((group) => (
                <div key={group.head}>
                  <div className="wander-mega-head">{group.head}</div>
                  {group.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMegaOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
              {SHOW_EDITORS_PICK && (
                <div className="wander-mega-feature">
                  <span className="wander-kicker">
                    <span className="bar" />
                    Editor&apos;s pick
                  </span>
                  <h4>Classic Switzerland in 7 days</h4>
                  <p>Five cities, two iconic peaks, one legendary train. From CHF 1,200.</p>
                  <Link
                    href="/itineraries/classic-switzerland-7-days"
                    className="wander-btn wander-btn-dark"
                    onClick={() => setMegaOpen(false)}
                  >
                    View itinerary →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="wander-mobile-panel">
            <nav>
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive(item) ? "on" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {MEGA_GROUPS.map((group) => (
                <div key={group.head} className="wander-mobile-group">
                  <div className="wander-mega-head">{group.head}</div>
                  {group.links.map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={toggle}
                className="wander-btn wander-btn-ghost wander-mobile-theme"
              >
                {theme === "day" ? <SunIcon /> : <MoonIcon />}
                <span style={{ marginLeft: 8 }}>
                  {theme === "day" ? "Switch to dusk" : "Switch to day"}
                </span>
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

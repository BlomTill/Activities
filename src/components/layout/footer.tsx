"use client";

import Link from "next/link";
import { resetConsent } from "@/components/analytics-consent";
import { isRouteEnabled } from "@/lib/constants";

const EXPLORE_LINKS = [
  { href: "/activities", label: "All Activities" },
  { href: "/destinations", label: "Destinations" },
  { href: "/itineraries", label: "Itineraries" },
  { href: "/travel-passes", label: "Travel Passes" },
  { href: "/budget", label: "Budget Explorer" },
  { href: "/map", label: "Map View" },
  { href: "/deals", label: "Deals" },
].filter((l) => isRouteEnabled(l.href));

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Privacy" },
  { href: "/partners", label: "Partners" },
].filter((l) => isRouteEnabled(l.href));

export function Footer() {
  return (
    <footer className="border-t border-[#1e1b17] bg-[#0c0b09] mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-[#ede8df]">
                Real<span style={{ color: "oklch(74% 0.13 63deg)" }}>Switzerland</span>
              </span>
            </Link>
            <p className="text-sm text-[#8a7e70] leading-relaxed">
              The independent guide to Switzerland — honest prices, hand-picked
              experiences, no fluff. Compare and book across every Swiss region.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a7e70]">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-[#7a6e60]">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-[#c4973a] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a7e70]">
              Categories
            </h3>
            <ul className="space-y-2 text-sm text-[#7a6e60]">
              <li><Link href="/activities?category=outdoor" className="hover:text-[#c4973a] transition-colors">Outdoor</Link></li>
              <li><Link href="/activities?category=culture" className="hover:text-[#c4973a] transition-colors">Culture</Link></li>
              <li><Link href="/activities?category=adventure" className="hover:text-[#c4973a] transition-colors">Adventure</Link></li>
              <li><Link href="/activities?category=family" className="hover:text-[#c4973a] transition-colors">Family</Link></li>
              <li><Link href="/activities?category=wellness" className="hover:text-[#c4973a] transition-colors">Wellness</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a7e70]">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-[#7a6e60]">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-[#c4973a] transition-colors">{l.label}</Link></li>
              ))}
              <li><a href="mailto:hello@realswitzerland.ch" className="hover:text-[#c4973a] transition-colors">Contact</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => resetConsent()}
                  className="hover:text-[#c4973a] transition-colors text-left"
                >
                  Manage cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#1e1b17] pt-8 text-center text-sm text-[#4a4030]">
          &copy; {new Date().getFullYear()} RealSwitzerland. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

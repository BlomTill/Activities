"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Menu, X, Scale, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

/**
 * Reduced 5-item top nav per MASTER_PLAN.md. Each item is either a
 * direct link, or a dropdown "mega-menu" that exposes the sub-pages.
 * Keeping the header quiet means the page below can carry the story.
 */
interface SubLink {
  href: string;
  label: string;
  blurb?: string;
}
interface NavItem {
  href: string;
  label: string;
  sub?: SubLink[];
}

const NAV: NavItem[] = [
  {
    href: "/destinations",
    label: "Destinations",
    sub: [
      { href: "/destinations", label: "All regions", blurb: "Browse every Swiss region" },
      { href: "/map", label: "Map", blurb: "Activities plotted across Switzerland" },
      { href: "/activities", label: "All activities", blurb: "The full catalogue" },
    ],
  },
  {
    href: "/plan",
    label: "Plan",
    sub: [
      { href: "/itineraries", label: "Itineraries", blurb: "Ready-made multi-day routes" },
      { href: "/planner", label: "Trip planner", blurb: "Build your own day by day" },
      { href: "/travel-passes", label: "Travel passes", blurb: "Swiss Travel Pass, explained" },
      { href: "/budget", label: "Budget explorer", blurb: "See what a week actually costs" },
      { href: "/guides", label: "All guides", blurb: "Rail, money, seasons, logistics" },
    ],
  },
  {
    href: "/activities",
    label: "Experience",
    sub: [
      { href: "/activities", label: "Browse activities", blurb: "Filter by season, budget, vibe" },
      { href: "/compare", label: "Compare picks", blurb: "Side-by-side decision helper" },
      { href: "/surprise", label: "Surprise me", blurb: "One-click random adventure" },
      { href: "/deals", label: "Deals", blurb: "Current discounts & free entries" },
    ],
  },
  {
    href: "/stories",
    label: "Stories",
  },
  {
    href: "/deals",
    label: "Deals",
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { comparisonList } = useComparison();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function isActive(item: NavItem) {
    if (pathname === item.href) return true;
    if (item.sub?.some((s) => pathname === s.href)) return true;
    return false;
  }

  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "top-0 z-50 border-b transition-all duration-300",
        isHome
          ? cn(
              "fixed w-full",
              scrolled
                ? "border-[#1e1b17]/80 bg-[#0c0b09]/90 backdrop-blur-xl"
                : "border-transparent bg-transparent"
            )
          : cn(
              "sticky",
              scrolled
                ? "border-[#1e1b17] bg-[#0c0b09]/95 backdrop-blur-xl"
                : "border-[#1e1b17]/60 bg-[#0c0b09]/90 backdrop-blur-xl"
            )
      )}
    >
      {!isHome && <div className="alpine-rule absolute inset-x-0 top-0 opacity-70" aria-hidden />}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          {isHome ? (
            <span className="font-[Cormorant_Garamond,serif] text-[1.05rem] font-semibold tracking-[0.05em] text-[#ede8df]">
              Explore<span className="text-[oklch(74%_0.13_63deg)]">.</span>Switzerland
            </span>
          ) : (
            <>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-[0_8px_18px_-6px_rgba(220,38,38,0.55)] transition-transform group-hover:-rotate-6 group-hover:scale-105">
                <Mountain className="h-5 w-5 text-white" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-white" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                <span className="font-[var(--font-geist-sans)] font-semibold tracking-tight text-[#ede8df]">Explore</span>
                <span className="ml-1 text-[oklch(74%_0.13_63deg)]">
                  Switzerland
                </span>
              </span>
            </>
          )}
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setOpenMenu(null)}
        >
          {NAV.map((item) => {
            const active = isActive(item);
            const hasSub = !!item.sub?.length;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasSub && setOpenMenu(item.label)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "link-flourish relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isHome
                      ? cn("text-[#9a9187] hover:text-[#ede8df] tracking-[0.12em] uppercase text-xs", active && "text-[#ede8df]")
                      : cn("hover:text-[#c4973a] transition-colors", active ? "text-[#c4973a]" : "text-[#b0a898]")
                  )}
                >
                  {item.label}
                  {hasSub && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </Link>

                {hasSub && openMenu === item.label && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                    <div className="w-80 rounded-xl border border-[#2a261f] bg-[#131210] p-2 shadow-xl animate-fade-up">
                      {item.sub!.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="block rounded-lg px-3 py-2 transition hover:bg-[#1e1b17]"
                          onClick={() => setOpenMenu(null)}
                        >
                          <div className="text-sm font-medium text-[#ede8df]">
                            {s.label}
                          </div>
                          {s.blurb && (
                            <div className="mt-0.5 text-xs text-[#8a7e70]">{s.blurb}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {comparisonList.length > 0 && (
            <Link
              href="/compare"
              className="relative rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Scale className="inline h-4 w-4 mr-1" />
              Compare
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-600">
                {comparisonList.length}
              </Badge>
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/privacy" className="text-xs font-medium text-[#8a7e70] transition-colors hover:text-[#c4973a]">
            Privacy
          </Link>
          <LanguageSwitcher />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#1e1b17] bg-[#0c0b09] px-4 pb-4 md:hidden animate-fade-up" style={{ animationDuration: "0.2s" }}>
          <nav className="flex flex-col gap-1 pt-2">
            {NAV.map((item) => (
              <div key={item.label} className="py-1">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#131210]",
                    isActive(item) ? "bg-[#131210] text-[#c4973a]" : "text-[#ede8df]"
                  )}
                >
                  {item.label}
                </Link>
                {item.sub?.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-6 py-1.5 text-sm text-[#8a7e70] hover:bg-[#131210] hover:text-[#c4973a]"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            ))}
            {comparisonList.length > 0 && (
              <Link
                href="/compare"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#b0a898]"
              >
                Compare ({comparisonList.length})
              </Link>
            )}
          </nav>
          <div className="mt-3 border-t border-[#1e1b17] pt-3">
            <Link
              href="/privacy"
              onClick={() => setMobileOpen(false)}
              className="mb-2 block rounded-md px-3 py-2 text-sm text-[#8a7e70] hover:bg-[#131210] hover:text-[#c4973a]"
            >
              Privacy
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

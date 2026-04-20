"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, Menu, X, Scale } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useComparison } from "@/context/comparison-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/activities", label: "Activities" },
  { href: "/itineraries", label: "Itineraries" },
  { href: "/travel-passes", label: "Travel Passes" },
  { href: "/budget", label: "Budget Explorer" },
  { href: "/map", label: "Map" },
  { href: "/deals", label: "Deals" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { comparisonList } = useComparison();

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="alpine-rule absolute inset-x-0 top-0 opacity-70" aria-hidden />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-[0_8px_18px_-6px_rgba(220,38,38,0.55)] transition-transform group-hover:-rotate-6 group-hover:scale-105">
            <Mountain className="h-5 w-5 text-white" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="font-story italic text-slate-800">Explore</span>
            <span className="ml-1 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Switzerland</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "link-flourish relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-red-600",
                pathname === link.href ? "text-red-600" : "text-gray-700"
              )}
            >
              {link.label}
            </Link>
          ))}
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
        <div className="border-t bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100",
                  pathname === link.href ? "bg-gray-100 text-red-600" : "text-gray-700"
                )}
              >
                {link.label}
              </Link>
            ))}
            {comparisonList.length > 0 && (
              <Link
                href="/compare"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700"
              >
                Compare ({comparisonList.length})
              </Link>
            )}
          </nav>
          <div className="mt-3 border-t pt-3">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

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
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Mountain className="h-7 w-7 text-red-600" />
          <span className="text-xl font-bold tracking-tight">
            Explore<span className="text-red-600">Switzerland</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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

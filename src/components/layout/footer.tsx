import Link from "next/link";
import { Mountain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Mountain className="h-6 w-6 text-red-600" />
              <span className="text-lg font-bold">
                Swiss<span className="text-red-600">Activity</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500">
              Discover and compare the best activities across Switzerland.
              Transparent pricing for every age group.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/activities" className="hover:text-red-600 transition-colors">All Activities</Link></li>
              <li><Link href="/budget" className="hover:text-red-600 transition-colors">Budget Explorer</Link></li>
              <li><Link href="/map" className="hover:text-red-600 transition-colors">Map View</Link></li>
              <li><Link href="/deals" className="hover:text-red-600 transition-colors">Deals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Categories
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/activities?category=outdoor" className="hover:text-red-600 transition-colors">Outdoor</Link></li>
              <li><Link href="/activities?category=culture" className="hover:text-red-600 transition-colors">Culture</Link></li>
              <li><Link href="/activities?category=adventure" className="hover:text-red-600 transition-colors">Adventure</Link></li>
              <li><Link href="/activities?category=family" className="hover:text-red-600 transition-colors">Family</Link></li>
              <li><Link href="/activities?category=wellness" className="hover:text-red-600 transition-colors">Wellness</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-red-600 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-red-600 transition-colors">Blog</Link></li>
              <li><a href="mailto:hello@swissactivity.ch" className="hover:text-red-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SwissActivity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

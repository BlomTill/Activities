import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1e1b17] bg-[#0c0b09] mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-[#ede8df]">
                Explore<span style={{ color: "oklch(74% 0.13 63deg)" }}>Switzerland</span>
              </span>
            </Link>
            <p className="text-sm text-[#8a7e70] leading-relaxed">
              Your Swiss travel companion — compare prices, plan group trips, and discover
              the best experiences across every region of Switzerland.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8a7e70]">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-[#7a6e60]">
              <li><Link href="/activities" className="hover:text-[#c4973a] transition-colors">All Activities</Link></li>
              <li><Link href="/destinations" className="hover:text-[#c4973a] transition-colors">Destinations</Link></li>
              <li><Link href="/itineraries" className="hover:text-[#c4973a] transition-colors">Itineraries</Link></li>
              <li><Link href="/travel-passes" className="hover:text-[#c4973a] transition-colors">Travel Passes</Link></li>
              <li><Link href="/budget" className="hover:text-[#c4973a] transition-colors">Budget Explorer</Link></li>
              <li><Link href="/map" className="hover:text-[#c4973a] transition-colors">Map View</Link></li>
              <li><Link href="/deals" className="hover:text-[#c4973a] transition-colors">Deals</Link></li>
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
              <li><Link href="/about" className="hover:text-[#c4973a] transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-[#c4973a] transition-colors">Blog</Link></li>
              <li><Link href="/privacy" className="hover:text-[#c4973a] transition-colors">Privacy</Link></li>
              <li><Link href="/partners" className="hover:text-[#c4973a] transition-colors">Partners</Link></li>
              <li><a href="mailto:hello@exploreswitzerland.ch" className="hover:text-[#c4973a] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[#1e1b17] pt-8 text-center text-sm text-[#4a4030]">
          &copy; {new Date().getFullYear()} ExploreSwitzerland. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

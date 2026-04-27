"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Train, Check, X, Calculator, ExternalLink, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AffiliateLink } from "@/components/affiliate-link";
import { AffiliateDisclosure } from "@/components/affiliate-disclosure";

interface TravelPass {
  id: string;
  name: string;
  shortName: string;
  description: string;
  prices: { adult: number; child: number; youth?: number; senior?: number };
  duration: string;
  coverage: string[];
  notCovered: string[];
  bestFor: string;
  affiliateUrl: string;
  color: string;
  popular?: boolean;
}

const TRAVEL_PASSES: TravelPass[] = [
  {
    id: "swiss-travel-pass-3",
    name: "Swiss Travel Pass (3 Days)",
    shortName: "STP 3-Day",
    description: "Unlimited travel on the Swiss Travel System network for 3 consecutive days, including trains, buses, boats, and free museum entry.",
    prices: { adult: 232, child: 0, youth: 165, senior: 209 },
    duration: "3 consecutive days",
    coverage: [
      "All SBB trains (2nd class)",
      "PostBus routes",
      "Lake boats & steamers",
      "Trams & buses in 90+ cities",
      "500+ museums (free entry)",
      "25-50% off most mountain railways",
    ],
    notCovered: [
      "Most mountain cable cars (but 25-50% discount)",
      "Glacier Express seat reservation (CHF 49)",
      "Bernina Express seat reservation (CHF 16)",
      "1st class (upgrade available)",
    ],
    bestFor: "Short city-hopping trips — great for Zurich + Lucerne + Bern in 3 days",
    affiliateUrl: "https://www.swiss-pass.ch",
    color: "border-red-500",
  },
  {
    id: "swiss-travel-pass-8",
    name: "Swiss Travel Pass (8 Days)",
    shortName: "STP 8-Day",
    description: "The most popular option — 8 consecutive days of unlimited travel. The best value for a full Switzerland trip.",
    prices: { adult: 399, child: 0, youth: 283, senior: 359 },
    duration: "8 consecutive days",
    coverage: [
      "All SBB trains (2nd class)",
      "PostBus routes",
      "Lake boats & steamers",
      "Trams & buses in 90+ cities",
      "500+ museums (free entry)",
      "25-50% off most mountain railways",
    ],
    notCovered: [
      "Most mountain cable cars (but 25-50% discount)",
      "Glacier Express seat reservation (CHF 49)",
      "Bernina Express seat reservation (CHF 16)",
      "1st class (upgrade available)",
    ],
    bestFor: "The classic 1-week Switzerland tour — covers everything for a full trip",
    affiliateUrl: "https://www.swiss-pass.ch",
    color: "border-red-500",
    popular: true,
  },
  {
    id: "swiss-travel-pass-15",
    name: "Swiss Travel Pass (15 Days)",
    shortName: "STP 15-Day",
    description: "Two full weeks of unlimited travel. Perfect for slow-paced travelers or combining multiple regions.",
    prices: { adult: 479, child: 0, youth: 340, senior: 431 },
    duration: "15 consecutive days",
    coverage: [
      "All SBB trains (2nd class)",
      "PostBus routes",
      "Lake boats & steamers",
      "Trams & buses in 90+ cities",
      "500+ museums (free entry)",
      "25-50% off most mountain railways",
    ],
    notCovered: [
      "Most mountain cable cars (but 25-50% discount)",
      "Glacier Express seat reservation (CHF 49)",
      "1st class (upgrade available)",
    ],
    bestFor: "Extended trips — worth it if you're traveling 10+ days across all regions",
    affiliateUrl: "https://www.swiss-pass.ch",
    color: "border-red-500",
  },
  {
    id: "half-fare-card",
    name: "Half-Fare Card",
    shortName: "Half-Fare",
    description: "50% off virtually all public transport in Switzerland for one month. The go-to card for residents and long-stay visitors.",
    prices: { adult: 120, child: 0, youth: 120, senior: 120 },
    duration: "1 month",
    coverage: [
      "50% off all SBB train tickets",
      "50% off most mountain railways",
      "50% off lake cruises",
      "50% off PostBus",
      "50% off local transport (most cities)",
      "Discounts on many activity tickets",
    ],
    notCovered: [
      "Does NOT include free travel (you pay 50% each time)",
      "No museum entry included",
      "Some private railways may vary",
    ],
    bestFor: "Stays longer than 8 days, or if you mostly travel between 2-3 cities",
    affiliateUrl: "https://www.sbb.ch/en/travelcards-and-tickets/railpasses/half-fare-travelcard.html",
    color: "border-blue-500",
  },
  {
    id: "swiss-travel-pass-flex",
    name: "Swiss Travel Pass Flex (8 Days)",
    shortName: "STP Flex 8",
    description: "Choose any 8 travel days within a 1-month period. Ideal if you're mixing city stays with day trips.",
    prices: { adult: 449, child: 0, youth: 318, senior: 404 },
    duration: "8 days within 1 month",
    coverage: [
      "All SBB trains (2nd class) on chosen days",
      "PostBus routes on chosen days",
      "Lake boats on chosen days",
      "Free museum entry for entire validity period",
      "25% off mountain railways on non-travel days",
      "50% off mountain railways on travel days",
    ],
    notCovered: [
      "Travel on non-activated days (pay separately or use 25% discount)",
      "Mountain cable cars at full price on non-travel days",
      "1st class (upgrade available)",
    ],
    bestFor: "Mixing hotel stays with day trips — flexibility for travelers who don't move every day",
    affiliateUrl: "https://www.swiss-pass.ch",
    color: "border-purple-500",
  },
  {
    id: "saver-day-pass",
    name: "Saver Day Pass",
    shortName: "Day Pass",
    description: "Unlimited travel for 1 day at a fixed price. Book early for the best rate — prices start from CHF 52.",
    prices: { adult: 52, child: 0, youth: 52, senior: 52 },
    duration: "1 day",
    coverage: [
      "All SBB trains (2nd class) for 1 day",
      "Most PostBus routes",
      "Local transport in many cities",
    ],
    notCovered: [
      "Mountain railways",
      "Lake cruises (some included)",
      "Museums",
      "Limited availability (book early)",
    ],
    bestFor: "Single day trips from your base — cheapest option if you only need 1-2 travel days",
    affiliateUrl: "https://www.sbb.ch",
    color: "border-green-500",
  },
];

function PassFeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1">
      {included ? (
        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
      )}
      <span className={cn("text-sm", included ? "text-gray-700" : "text-gray-400")}>
        {label}
      </span>
    </div>
  );
}

export default function TravelPassesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-16 text-center text-gray-400">Loading travel pass comparison...</div>}>
      <TravelPassesContent />
    </Suspense>
  );
}

function TravelPassesContent() {
  const searchParams = useSearchParams();
  const initialTripDays = Number(searchParams.get("tripDays") || "8");
  const initialTravelDays = Number(searchParams.get("travelDays") || "6");
  const [tripDays, setTripDays] = useState(Number.isFinite(initialTripDays) ? Math.min(30, Math.max(1, initialTripDays)) : 8);
  const [travelDays, setTravelDays] = useState(Number.isFinite(initialTravelDays) ? Math.min(15, Math.max(1, initialTravelDays)) : 6);
  const [expandedPass, setExpandedPass] = useState<string | null>(null);

  const recommendation = useMemo(() => {
    if (tripDays <= 3) return "swiss-travel-pass-3";
    if (tripDays <= 8 && travelDays >= tripDays - 1) return "swiss-travel-pass-8";
    if (tripDays <= 8 && travelDays < tripDays - 1) return "swiss-travel-pass-flex";
    if (tripDays <= 15 && travelDays >= 8) return "swiss-travel-pass-15";
    if (tripDays > 15) return "half-fare-card";
    return "swiss-travel-pass-8";
  }, [tripDays, travelDays]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm">
            <Train className="h-4 w-4 mr-1" /> Save up to 50% on transport
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Swiss Travel Passes Compared
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Find the right pass for your trip — we compare prices, coverage, and value
            so you don&apos;t overpay for Swiss trains, buses, and boats.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="mx-auto max-w-5xl px-4 -mt-8">
        <Card className="shadow-lg border-2 border-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Which pass is right for you?</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many days is your trip?
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={tripDays}
                  onChange={(e) => setTripDays(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 day</span>
                  <span className="text-sm font-semibold text-indigo-600">{tripDays} days</span>
                  <span>30 days</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many days will you travel between cities?
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.min(tripDays, 15)}
                  value={Math.min(travelDays, tripDays)}
                  onChange={(e) => setTravelDays(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 day</span>
                  <span className="text-sm font-semibold text-indigo-600">{Math.min(travelDays, tripDays)} days</span>
                  <span>{Math.min(tripDays, 15)} days</span>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-indigo-50 p-3 flex items-start gap-2">
              <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900">
                  Our recommendation: <span className="text-indigo-600">{TRAVEL_PASSES.find((p) => p.id === recommendation)?.name}</span>
                </p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  {TRAVEL_PASSES.find((p) => p.id === recommendation)?.bestFor}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto mt-8 max-w-5xl px-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">How we recommend passes</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            We bias toward the pass that best matches how often you move between cities, not the one with the highest headline price.
            That keeps the recommendation more trustworthy and usually helps affiliate conversions too.
          </p>
        </div>
      </section>

      {/* Pass Cards */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Travel Passes</h2>
        <div className="grid gap-4">
          {TRAVEL_PASSES.map((pass) => {
            const isRecommended = pass.id === recommendation;
            const isExpanded = expandedPass === pass.id;

            return (
              <Card
                key={pass.id}
                className={cn(
                  "transition-all",
                  isRecommended && "ring-2 ring-indigo-500 shadow-lg",
                  pass.color
                )}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{pass.name}</h3>
                        {isRecommended && (
                          <Badge className="bg-indigo-100 text-indigo-700 text-xs">Recommended for you</Badge>
                        )}
                        {pass.popular && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">Most Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{pass.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Duration: {pass.duration}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">CHF {pass.prices.adult}</div>
                        <div className="text-xs text-gray-500">per adult</div>
                        {pass.prices.child === 0 && (
                          <div className="text-xs text-green-600 font-medium">Kids free (6-15)</div>
                        )}
                      </div>
                      <AffiliateLink href={pass.affiliateUrl} slot="other" providerName={pass.name}>
                        <Button className="bg-red-600 hover:bg-red-700 gap-1">
                          Buy <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </AffiliateLink>
                    </div>
                  </div>
                  <div className="mt-3">
                    <AffiliateDisclosure />
                  </div>

                  {/* Expandable details */}
                  <button
                    onClick={() => setExpandedPass(isExpanded ? null : pass.id)}
                    className="flex items-center gap-1 mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {isExpanded ? "Hide details" : "Show details"}
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 border-t pt-4">
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-1">What&apos;s included</h4>
                        {pass.coverage.map((item) => (
                          <PassFeatureRow key={item} label={item} included={true} />
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-1">Not included / extra cost</h4>
                        {pass.notCovered.map((item) => (
                          <PassFeatureRow key={item} label={item} included={false} />
                        ))}
                      </div>
                      <div className="sm:col-span-2 rounded-lg bg-blue-50 p-3">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Best for:</span> {pass.bestFor}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quick comparison table */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white border-b">
                  <th className="text-left p-3 font-semibold text-gray-900">Feature</th>
                  <th className="text-center p-3 font-semibold text-gray-900">STP 3-Day</th>
                  <th className="text-center p-3 font-semibold text-gray-900">STP 8-Day</th>
                  <th className="text-center p-3 font-semibold text-gray-900">STP Flex</th>
                  <th className="text-center p-3 font-semibold text-gray-900">Half-Fare</th>
                  <th className="text-center p-3 font-semibold text-gray-900">Day Pass</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Adult price</td>
                  <td className="text-center p-3 font-medium">CHF 232</td>
                  <td className="text-center p-3 font-medium">CHF 399</td>
                  <td className="text-center p-3 font-medium">CHF 449</td>
                  <td className="text-center p-3 font-medium">CHF 120</td>
                  <td className="text-center p-3 font-medium">from CHF 52</td>
                </tr>
                <tr className="border-b bg-white">
                  <td className="p-3 text-gray-700">Unlimited trains</td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3 text-xs text-gray-500">On travel days</td>
                  <td className="text-center p-3 text-xs text-gray-500">50% off</td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Museum entry</td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                  <td className="text-center p-3"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                </tr>
                <tr className="border-b bg-white">
                  <td className="p-3 text-gray-700">Mountain discount</td>
                  <td className="text-center p-3 text-xs">25-50%</td>
                  <td className="text-center p-3 text-xs">25-50%</td>
                  <td className="text-center p-3 text-xs">25-50%</td>
                  <td className="text-center p-3 text-xs">50%</td>
                  <td className="text-center p-3"><X className="h-4 w-4 text-gray-300 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 text-gray-700">Kids free</td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b bg-white">
                  <td className="p-3 text-gray-700">Cost per day (8-day trip)</td>
                  <td className="text-center p-3 text-xs text-gray-400">N/A (3 days)</td>
                  <td className="text-center p-3 font-medium text-green-700">CHF 50/day</td>
                  <td className="text-center p-3 font-medium">CHF 56/day</td>
                  <td className="text-center p-3 font-medium">CHF 15/day + tickets</td>
                  <td className="text-center p-3 font-medium">CHF 52/day</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ / Tips */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Pass Tips</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900">Swiss Travel Pass vs Half-Fare Card?</h3>
              <p className="text-sm text-gray-600 mt-1">
                If you travel between cities almost every day, the Swiss Travel Pass saves more.
                If you stay in one base and take occasional day trips, the Half-Fare Card is cheaper.
                Break-even point: typically around 4-5 long-distance trips in a week.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900">Do kids travel free?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Children under 6 always travel free. Children 6-15 travel free with a parent who has a Swiss Travel Pass
                (request a free Swiss Family Card). This alone can save a family hundreds of francs.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900">Can I use it on mountain railways?</h3>
              <p className="text-sm text-gray-600 mt-1">
                The Swiss Travel Pass gives 25-50% discounts on most mountain railways (Jungfraujoch, Titlis,
                Schilthorn, etc.), but they are not included free. The Half-Fare Card gives a flat 50% off.
                Some mountain railways like the Rigi are fully included with the Swiss Travel Pass.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

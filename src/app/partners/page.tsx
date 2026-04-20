import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { AFFILIATE_PARTNERS } from "@/data/affiliate-partners";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Our Partners & Disclosure — ${SITE_NAME}`,
  description:
    "The booking partners we work with, how we choose them, and exactly how we make money. No hidden fees, no paid promotions — just transparent affiliate relationships.",
};

const tierLabel: Record<string, string> = {
  primary: "Primary partners",
  secondary: "Supporting partners",
  niche: "Specialist partners",
};

export default function PartnersPage() {
  const tiers = ["primary", "secondary", "niche"] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-4">
          <Handshake className="h-3.5 w-3.5" />
          Full transparency
        </div>
        <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Our partners, and how we stay free.
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {SITE_NAME} is free for you because some booking links pay us a small
          commission when you complete a purchase. You pay the same price
          either way — commission comes out of the partner&apos;s margin, never
          on top of your bill.
        </p>
      </div>

      {/* How we choose */}
      <section className="mb-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <Sparkles className="h-8 w-8 text-amber-500 mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            How we choose partners
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            We only partner with operators that meet three criteria: reliable
            booking & refund policies, fair pricing (we spot-check against
            the official operator), and strong real-world reviews. A higher
            commission <em>never</em> moves a partner up the page.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <ShieldCheck className="h-8 w-8 text-emerald-600 mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Editorial independence
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            Stories, guides, and rankings are written without partner input.
            When possible we always show the official operator first, so you
            can compare. If we like an activity, we say so — if we don&apos;t,
            we don&apos;t list it.
          </p>
        </div>
      </section>

      {/* Partner list grouped by tier */}
      {tiers.map((tier) => {
        const list = AFFILIATE_PARTNERS.filter((p) => p.tier === tier);
        if (!list.length) return null;
        return (
          <section key={tier} className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              {tierLabel[tier]}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {p.commissionRate}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {p.disclosure}
                  </p>
                  <a
                    href={`https://${p.domains[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Visit {p.domains[0]}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* FTC / FAQ */}
      <section className="mt-16 rounded-2xl bg-gray-50 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Frequently asked
        </h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-medium text-gray-900">
              Do I pay more if I book through your link?
            </p>
            <p className="mt-1 leading-relaxed">
              No. Prices through our affiliate links are the same as going
              direct — sometimes cheaper, when partners run promos. The
              commission comes out of the partner&apos;s share.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Can partners pay to be featured?
            </p>
            <p className="mt-1 leading-relaxed">
              No. Rankings, featured picks, and editorial coverage are not
              for sale. If an activity is great we list it. If it&apos;s not,
              we don&apos;t.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              How do I book without supporting the site?
            </p>
            <p className="mt-1 leading-relaxed">
              Every activity page shows the official operator&apos;s website
              directly, usually at the top. Go straight there and we earn
              nothing — no hard feelings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Questions about our partnerships or editorial policy?
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
        >
          Read more about us
        </Link>
      </div>
    </div>
  );
}

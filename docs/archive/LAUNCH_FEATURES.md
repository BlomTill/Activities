# Launch features (lean mode)

Lean launch ships only what is needed to validate the affiliate-comparison thesis: the user finds an activity, sees real prices from multiple booking partners, and clicks through to whichever partner has the best deal. Everything else is hidden behind a feature flag and can be re-enabled without code changes once it's content-complete.

## How to flip modes

`.env.local`:

```
# Lean launch (default — Activities + Compare + Destinations only)
# NEXT_PUBLIC_LAUNCH_MODE=lean

# Full nav (Stories, Itineraries, Map, Deals exposed)
NEXT_PUBLIC_LAUNCH_MODE=full
```

The flag is read in `src/components/layout/header.tsx`. Code paths for hidden features still build and deploy; only the navigation entry points are removed.

## In for launch

Activities — list, detail, and search. Detail pages show the live `PriceComparisonTable`, AggregateOffer JSON-LD, and affiliate-tracked CTAs.

Compare — landing page that explains the cross-platform comparison thesis (`/compare`).

Destinations — region/city landing pages. These are the SEO anchors for "things to do in Zurich" / "Lucerne activities" queries.

Partners + Privacy — legally required for affiliate disclosure (FTC, EU).

About — minimal contact / mission page.

## Hidden for launch (re-enable later)

Stories / blog — `/stories`, `/blog`. The content shelf is thin and most posts are auto-generated. Re-enable once 8+ posts are hand-edited.

Itineraries — `/itineraries`. Promising format but only 5 itineraries exist; needs 15+ to feel like a real product.

Map view — `/map`. Nice-to-have. Add once we have geocoded data on the published 51.

Deals — `/deals`. Empty until we negotiate exclusive partner deals.

Trip planner / Budget calculator / Surprise me / Travel passes — speculative features in the original mega-menu. Cut for launch.

Newsletter signup — `/newsletter`. No audience yet → nothing to send. Re-enable when traffic > 100 sessions/day.

Trending bar, Recently viewed, SBB estimator, Weather widget, PWA install prompt — code stays, mounts removed from the homepage. Each is a distraction on a comparison page; re-add A/B-tested.

Age group selector on activity cards — replaced by a single "from CHF X" line on cards. Detail page still supports per-age pricing where the data exists.

## Why this scope

Three things drive affiliate revenue: (1) showing real prices from multiple partners, (2) trustworthy imagery, (3) a single visible CTA. Every feature on the cut list either competes for attention with that CTA or distracts the user from booking. Strip them, ship the comparison, then add features back when their conversion impact is measurable.

## Re-enabling a feature

1. Set `NEXT_PUBLIC_LAUNCH_MODE=full` in `.env.local` (or in Vercel env).
2. Or move a single feature out of the launch mode by editing `NAV_LINKS_LEAN` / `MEGA_GROUPS_LEAN` in `src/components/layout/header.tsx`.
3. Re-deploy.

No code changes are needed for individual feature enablement at the route level — the routes still exist and serve traffic from direct links and old indexed URLs.

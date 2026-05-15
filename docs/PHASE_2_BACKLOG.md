# Phase 2 backlog — deferred from Phase 1

Everything intentionally NOT built in the Money MVP. Do not start any of this
until Phase 1 is shipped and verified (`MVP_LAUNCH_PLAN.md` §3 has the day-plan).

## Re-enable hidden routes (polish each, then flip its flag)
- `/planner`, `/budget`, `/surprise`, `/itineraries`, `/travel-passes`,
  `/map`, `/guides`, `/partners`, `/deals`, `/regions`, `/plan`
- Flags live in `src/lib/constants.ts`; see `KILLED.md` for the env var per route.
- When re-enabling `/itineraries`/`/budget`/`/map`/`/deals`/`/surprise`/`/partners`,
  also re-add their `sitemap.ts` static entries.

## Live prices (Days 8–10)
- `src/lib/live-prices.ts` is correct as-is; needs `GETYOURGUIDE_API_KEY`,
  `VIATOR_API_KEY`, Klook key+secret.
- "Updated N min ago" freshness chip on price-comparison-table.
- A/B test live vs static fallback.

## Real search (Days 11–13)
- MeiliSearch (self-hosted). Index 200 MVP activities first, then the rest.
- Replace header search dropdown with Meili autocomplete; add `/search?q=`.

## Personalization (Days 14–17)
- Wire existing `age-group-context.tsx`, `group-context.tsx`,
  `recently-viewed.tsx`. Onboarding modal, saved-trip (localStorage), retargeting params.

## SEO content engine (Days 18–21)
- Restore 5 more stories; write 3 new evergreen pieces; Pinterest pin
  generator via `@vercel/og`; HARO + outreach.

## Image / content audit (post-launch)
- ~1,300 non-MVP activities: vision-verify photos
  (`scripts/verify-activity-images.mjs`), then progressively add to
  `src/data/mvp-slugs.json`.
- 52 activities failed the photo gate, 104 failed the marketplace gate, 575
  had no destination match — revisit when expanding beyond 5 destinations.

## Infra / data store
- Supabase Postgres + admin CMS when editing volume exceeds ~50/week.

---

### Found-during-Phase-1, parked here
_(append as discovered; do not action in Phase 1)_

- **Destination hero photos are CC0 Unsplash placeholders** (`src/lib/mvp-destinations.ts` `heroImage`). Replace with licensed/owned photography of each city before scaling marketing. Same for the home `TopDestinations` cards (reuse the same URLs).
- **Legacy region-based destinations system now unused by routes**: `src/lib/destinations.ts`, `src/components/destination-browser.tsx`, `src/components/destination-detail-tabs.tsx`, `getRelatedBlogPostsForDestination`. Kept (not deleted) in case Phase 2 wants region browsing. Safe to remove if it stays unused.
- Activity-route first-load JS still ~723KB (Day 3 finding) — Day 6 bundle audit.

- `src/app/activities/page.tsx` still ships a per-request `.map()` projection
  over the MVP set on the server — fine at 200, revisit if MVP count grows.

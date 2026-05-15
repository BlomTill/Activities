# KILLED.md — what was hidden / archived / removed and how to restore it

Phase 1 "Money MVP" cuts. Nothing here is irreversible. Each entry: **what**, **why**, **how to restore**.

---

## Feature-flagged routes (hidden, not deleted)

All routes below still exist in the codebase. They return `notFound()` (404)
while their flag is off. Flag logic: `src/lib/constants.ts` (`isFeatureEnabled`)
+ `src/lib/feature-gate.ts` (`gateFeature`). Nav is filtered in
`src/components/layout/header.tsx`.

| Route | Flag env var | Restore |
|---|---|---|
| `/planner` | `NEXT_PUBLIC_FEATURE_PLANNER` | set `=on` |
| `/budget` | `NEXT_PUBLIC_FEATURE_BUDGET` | set `=on` |
| `/surprise` | `NEXT_PUBLIC_FEATURE_SURPRISE` | set `=on` |
| `/itineraries` (+ `/itineraries/[slug]`) | `NEXT_PUBLIC_FEATURE_ITINERARIES` | set `=on` |
| `/travel-passes` | `NEXT_PUBLIC_FEATURE_TRAVEL_PASSES` | set `=on` |
| `/map` | `NEXT_PUBLIC_FEATURE_MAP` | set `=on` |
| `/guides` | `NEXT_PUBLIC_FEATURE_GUIDES` | set `=on` |
| `/partners` | `NEXT_PUBLIC_FEATURE_PARTNERS` | set `=on` |
| `/deals` | `NEXT_PUBLIC_FEATURE_DEALS` | set `=on` |
| `/regions` | `NEXT_PUBLIC_FEATURE_REGIONS` | set `=on` |
| `/plan` | `NEXT_PUBLIC_FEATURE_PLAN` | set `=on` |

**Why:** these features are not content-/polish-complete for launch. Hiding
them keeps the public surface small and avoids shipping half-finished UX.
**How to restore:** add the env var with value `on` in `.env.local` and/or
Vercel project env, redeploy. Each can be flipped independently.

Side effects of the off state:
- Header nav & mega-menu drop any link pointing at an off route
  (`routeEnabled()` in `header.tsx`).
- The mega-menu "Editor's pick" card (linked `/itineraries/...`) is hidden
  while `ITINERARIES` is off.
- `sitemap.ts` no longer emits `/itineraries`, `/budget`, `/map`, `/deals`,
  `/surprise`, `/partners` (they'd be 404s). Restore those entries in
  `src/app/sitemap.ts` when re-enabling.

---

## ~1,300 activities excluded from index/sitemap (not deleted)

**What:** Only ~200 activities (flag `mvp: true`) appear on the home page,
`/activities` list, and sitemap. The other ~1,300 JSON entries remain fully in
the dataset and their `/activities/[slug]` detail pages still render.
**Why:** 1,513 thin pages is an SEO liability (Helpful-Content / doorway
penalty). MVP ships a curated, photo-confirmed, bookable subset.
**How to restore / change:** edit `src/data/mvp-slugs.json` (or re-run
`node scripts/select-mvp-activities.mjs --count=N`) then `npm run content:build`.
To revert to "everything visible", point `sitemap.ts` /
`src/app/activities/page.tsx` / `src/app/page.tsx` back at `activities`
instead of `mvpActivities` in `src/lib/content/selectors.ts`.

---

## Deleted files (recoverable from git history)

| What | Why | Restore |
|---|---|---|
| `content/activities 2/`, `content/activities 3/` | Finder-copy duplicates (~12MB) | `git checkout <pre-Day1-commit> -- "content/activities 2"` etc. |
| `content/itineraries 2/`, `itineraries 3/` | duplicates | git checkout |
| `content/stories 2/`, `stories 3/` | duplicates | git checkout |
| `Switzerland Activities.html` | 82KB legacy mock, references wander.ch | git checkout |

No canonical activity/itinerary/story JSON was deleted — only Finder duplicates.

---

## Archived (moved, not deleted)

Moved to `docs/archive/`: `LAUNCH_PLAN.md`, `LAUNCH_PLAN_v2.md`,
`MASTER_PLAN.md`, `PLAN_ExploreSwitzerland.md`, `GUIDE_StepByStep.md`,
`LAUNCH_FEATURES.md`. **Why:** superseded by `MVP_LAUNCH_PLAN.md`.
**Restore:** `git mv docs/archive/<file> .`

---

## Region-based destination pages → replaced by 5 MVP city pages (Day 5)

**What:** `/destinations` and `/destinations/[slug]` were rebuilt around the 5
MVP destinations (zurich/lucerne/interlaken/zermatt/geneva) via
`src/lib/mvp-destinations.ts`. The old ~31 region slugs (e.g.
`/destinations/bern-region`) now return 404.
**Why:** the plan's IA is 5 city destination pages; the old region
`/destinations/[slug]` also threw a 500 (RSC `GYG_CITIES` import bug) — the
rewrite fixes that.
**How to restore region pages:** `src/lib/destinations.ts`,
`destination-browser.tsx`, `destination-detail-tabs.tsx` are untouched in the
tree; the old `src/app/destinations/**` is in git history before the Day 5
commit. Restore from there (and fix the `GYG_CITIES` server-import first).
